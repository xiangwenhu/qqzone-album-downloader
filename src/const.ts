import path from "path";
import os from "os";
import config from "./config";


export const IS_WINDOWS = os.type().toLowerCase().includes("windows");

console.log("os.type()", os.type())

export const CHROME_PATH = config.chrome;

export const PUPPETEER_LAUNCH_OPTIONS_BUILTIN = {
    headless: true,
    ignoreHTTPSErrors: true,
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
}


export const PUPPETEER_LAUNCH_OPTIONS_CHROME = {
    ...PUPPETEER_LAUNCH_OPTIONS_BUILTIN,
    headless: false,
    executablePath: CHROME_PATH
}


export const PUPPETEER_LAUNCH_OPTIONS_CHROME_XVFB = {
    ...PUPPETEER_LAUNCH_OPTIONS_CHROME,
    env: {
        DISPLAY: ":7.0"
    }
}

export function getLaunchOptions() {
    return IS_WINDOWS ? PUPPETEER_LAUNCH_OPTIONS_CHROME : PUPPETEER_LAUNCH_OPTIONS_CHROME_XVFB
}


export const HOME_URL = "https://user.qzone.qq.com";


export const API_URLS = {
    /**
     * 相册列表
     */
    fcg_list_album_v3: "https://user.qzone.qq.com/proxy/domain/photo.qzone.qq.com/fcgi-bin/fcg_list_album_v3",
    /**
     * 相册的图片
     */
    cgi_list_photo: "https://user.qzone.qq.com/proxy/domain/photo.qzone.qq.com/fcgi-bin/cgi_list_photo"
}