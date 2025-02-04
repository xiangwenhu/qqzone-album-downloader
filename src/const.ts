import path from "path";
import os from "os";


export const IS_WINDOWS = os.type().toLowerCase().includes("windows");

console.log("os.type()", os.type())

export const CHROME_PATH = IS_WINDOWS ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : path.resolve("/usr/bin/google-chrome");


export const DATA_ROOT_DY = path.resolve("/data/crawl/dy");


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
    fcg_list_album_v3: "https://user.qzone.qq.com/proxy/domain/photo.qzone.qq.com/fcgi-bin/fcg_list_album_v3"
}