import { delay } from ".";
import logger from "../logger";

const noop = () => { };

interface OnRetryFunction {
    (retryTimes: number): void
}

/**
 * 尝试异步工作
 * @param {*} job 异步函数
 * @param {*} retryCount 重试次数
 * @param {*} onRetry 当重试的回调函数
 * @returns 
 */
export async function retryAsyncJob(job: Function, retryCount = 1, onRetry: OnRetryFunction = noop, errPrefix: string = '', errMsg?: string) {
    let lastError: any;
    for (let i = 0; i <= retryCount; i++) {
        try {
            if (i !== 0) {
                onRetry(i);
            }
            const res = await job();
            return res;
        } catch (err) {
            lastError = err
            logger.error(`retryAsyncJob error: failed times: ${i + 1}`, err);
            await delay(2000);
        }
    }

    const msg = `${errPrefix ? errPrefix + ':' : ''} ${errMsg || lastError && lastError.message || `retryAsyncJob ${job.name} failed`}`

    throw new Error(msg)
}



// export async function retryRequestJob<T extends ResData>(job: () => Promise<T>, retryCount = 1, onRetry: OnRetryFunction = noop, errPrefix: string = '') {
//     return retryAsyncJob(async function innerJob() {
//         const res = await job();
//         if (!res || res.errCode !== 0) throw new Error(res && res.errMsg || "请求失败");
//         return res;
//     }, retryCount, onRetry, errPrefix) as Promise<T>
// }