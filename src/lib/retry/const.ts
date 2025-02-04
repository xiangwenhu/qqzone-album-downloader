import { RetryOptions } from "./types";

export const DEFAULT_OPTIONS: RetryOptions = {
    attemptTimes: 10,
    factor: 2,
    minTimeout: 1 * 1000,
    maxTimeout: 2000,
    context: null,
    args: null,
};