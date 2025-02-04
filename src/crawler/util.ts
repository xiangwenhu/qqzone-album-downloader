import { Frame, Page } from "puppeteer-core";
import { HOME_URL } from "../const";
import logger from "../logger";
import { ensureGoto } from "../puppeteer";
import { retryAsyncJob } from "../util/retry";

export async function checkLogin(page: Page, targetUrl: string) {
    await retryAsyncJob(async () => {
        await ensureGoto(page, targetUrl, {
            waitUntil: "load",
            timeout: 50 * 1000
        })
    }, 1, undefined, "跳转到首页失败")
    const url = page.url();
    const isLogin = url.toLowerCase().startsWith(targetUrl.toLowerCase());
    if (!isLogin) {
        throw new Error("cookie已失效")
    }
}



export function uploadResult(p: () => Promise<any>, errMsg: string) {
    return retryAsyncJob(async () => {
        const res = await p();
        if (!res || res.errCode !== 0) {
            throw new Error(errMsg + res?.errMsg)
        }
        return res.data;
    }, 1, undefined, errMsg)
}

