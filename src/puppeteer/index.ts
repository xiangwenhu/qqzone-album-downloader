import puppeteer, { Page, LaunchOptions, WaitForOptions } from "puppeteer-core";
import _ from "lodash";
import logger from "../logger";
import { delay } from "../util";

/**
 * 创建浏览器和页面
 * @returns
 */
export async function createBrowserAndPage(options: LaunchOptions = {}) {
    const browser = await createBrowser(options);
    const page = await browser.newPage();
    return {
        page,
        browser,
    };
}

const DEFAULT_LAUNCH_OPTIONS: LaunchOptions = {
    headless: true,
    defaultViewport: null,
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
        '--start-maximized',
        "--no-sandbox",
        "--disable-web-security",
        "--disable-setuid-sandbox",
        "--allow-running-insecure-content",
        "--unsafely-treat-insecure-origin-as-secure"
    ],
    timeout: 60 * 1000,
    userDataDir: "/data/chrome/userDataDir"
}

export async function createBrowser(options: LaunchOptions = {}) {
    const mOption = _.merge({}, DEFAULT_LAUNCH_OPTIONS, options);
    logger.log('createBrowser:', mOption);
    const browser = await puppeteer.launch(mOption);
    return browser;
}


/**
 * 确保页面跳转
 * @param page 
 * @param url 
 * @returns 
 */
export function ensureGoto(page: Page, url: string, options: WaitForOptions | undefined = {}) {
    if (page.url().toLowerCase() === url.toLowerCase()) {
        return page.reload(options)
    }
    return page.goto(url, options);
}


export async function checkLogin(page: Page, gotoUrl: string) {
    await ensureGoto(page, gotoUrl, {
        waitUntil: "load",
        timeout: 50 * 1000
    });

    // 再等待
    await delay(8 * 1000);

    const url = page.url();
    const isLogin = url.toLowerCase().startsWith(gotoUrl.toLowerCase());
    if (!isLogin) {
        throw new Error("cookie已失效")
    }
}
