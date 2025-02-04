import { DEFAULT_OPTIONS } from "../const";
import { RetryOptions, RetryTimeoutOption } from "../types";

export function createTimeoutTimes(options: RetryOptions | number[]): number[] {
    if (Array.isArray(options)) {
        // @ts-ignore
        return [...options]
    }

    const opts: RetryOptions = Object.assign({}, DEFAULT_OPTIONS, options)

    if (opts.minTimeout! > opts.maxTimeout!) {
        throw new Error('maxTimeout must greater or equal to minTimeout');
    }

    const timeouts: number[] = [];
    for (var i = 0; i < opts.attemptTimes!; i++) {
        timeouts.push(createTimeoutTime(i, opts));
    }

    return timeouts;
};


function createTimeoutTime(attempt: number, opts: RetryTimeoutOption) {
    let timeout = Math.round(Math.max(opts.minTimeout!, 1) * Math.pow(opts.factor!, attempt));
    timeout = Math.min(timeout, opts.maxTimeout!);

    return timeout;
};