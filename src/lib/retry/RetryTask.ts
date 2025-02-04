import EventEmitter from "events";
import {
    CommonFunction,
    EventName,
    RetryOptions,
    TaskCompleteFun,
    TaskErrorFun,
    TaskRetryFun,
} from "./types";
import { DEFAULT_OPTIONS } from "./const";
import * as timeouts from "./util/timeouts";

class RetryTask {
    protected ticket: any;
    protected fn: Function | null = null;
    protected _attemptTimes: number = 1;
    protected _timeouts: number[] | null = [];
    protected oriTimeouts: number[] = [];
    protected isRunning: boolean = false;
    protected options: RetryOptions;

    protected emitter = new EventEmitter();

    public get attemptTimes() {
        return this._attemptTimes;
    }

    public get timeouts() {
        return this.oriTimeouts;
    }

    constructor(options: RetryOptions = {}) {
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
        this._timeouts = [];
        this.oriTimeouts = [];
    }

    reset() {
        this.ticket && clearTimeout(this.ticket);
        this._attemptTimes = 1;
        this._timeouts = [...this.oriTimeouts];
        this.isRunning = false;
        return this;
    }

    stop() {
        this.ticket && clearTimeout(this.ticket);
        this.isRunning = false;
        return this;
    }

    start(fn: Function, options: RetryOptions = {}) {
        this.prepareStart(fn, options);
        this.isRunning = true;
        this.attempt();
    }

    startPromise(fn: Function, options: RetryOptions = {}) {
        if (this.isRunning) {
            return Promise.reject(new Error("task is running"));
        }

        return new Promise((resolve, reject) => {
            const onComplete = function (attemptTimes: number, res: any) {
                resolve({ attemptTimes, data: res });
            };
            const onError = function (error: any) {
                reject(error);
            };
            this.emitter.once("complete", onComplete);
            this.emitter.once("error", onError);
            this.start(fn, options);
        });
    }

    protected prepareStart(fn: Function, options: RetryOptions = {}) {
        if (this.isRunning) {
            return;
        }
        this.options = Object.assign(
            {},
            DEFAULT_OPTIONS,
            this.options,
            options
        );
        this._timeouts = timeouts.createTimeoutTimes(this.options);
        this.oriTimeouts = this._timeouts;
        this.fn = fn;
    }

    protected attempt(): any {
        try {
            const { context, args } = this.options;
            const result = this.fn!.apply(context, args);
            this._onComplete(result);
        } catch (err) {
            this.retry(err);
        }
    }

    protected retry = (err: any) => {
        const timeout = this._timeouts?.shift();
        if (this._attemptTimes >= this.options.attemptTimes!) {
            this._onAttemptError(err);
            this._onError(
                new Error(`尝试次数超过最大尝试次数:${this.options.attemptTimes}`)
            );
            return;
        }
        this._onAttemptError(err);
        this.ticket = setTimeout(() => {
            this._attemptTimes++;
            this.attempt();
        }, timeout);
    };

    onAttemptError(fn: TaskRetryFun) {
        this._on("attemptError", fn);
        return this;
    }

    onComplete<R>(fn: TaskCompleteFun<R>) {
        this._on("complete", fn);
        return this;
    }

    onError(fn: TaskErrorFun) {
        this._on("error", fn);
        return this;
    }

    protected _on(evName: EventName, fn: CommonFunction) {
        this.emitter.on(evName, fn);
    }

    protected _onComplete = (res: any) => {
        this.isRunning = false;
        this.emitter.emit("complete", this._attemptTimes, res);
    };

    protected _onAttemptError(error: any) {
        this.emitter.emit("attemptError", this._attemptTimes, error);
    }

    protected _onError(error: any) {
        this.isRunning = false;
        this.emitter.emit("error", error);
    }
}

export default RetryTask;
