import os from "os";
import path from "path";
import { LaunchOptions } from "puppeteer-core";

export const IS_WINDOWS = os.type().toLowerCase().includes("windows");

console.log("os.type()", os.type())

export const CHROME_PATH = IS_WINDOWS ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : path.resolve("/usr/bin/google-chrome");

export const PUPPETEER_LAUNCH_OPTIONS_BUILTIN: LaunchOptions = {
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
    executablePath: CHROME_PATH,
}


export const PUPPETEER_LAUNCH_OPTIONS_CHROME_XVFB = {
    ...PUPPETEER_LAUNCH_OPTIONS_BUILTIN,
    env: {
        DISPLAY: ":7.0"
    }
}

export function getLaunchOptions(): LaunchOptions {
    return IS_WINDOWS ? {
        ...PUPPETEER_LAUNCH_OPTIONS_BUILTIN,
        headless: false
    } : PUPPETEER_LAUNCH_OPTIONS_BUILTIN
}
