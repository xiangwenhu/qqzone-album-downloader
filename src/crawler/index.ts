import { Browser, Cookie, Page, Protocol } from "puppeteer-core";
import logger from "../logger";
import * as pup from "../puppeteer";
import { arrayToMap, delay, startWithTimeout, uniqueArray } from "../util";
import { checkLogin } from "./util";
import { getLaunchOptions } from "../puppeteer/const";
import { API_URLS, HOME_URL } from "../const";

interface Options {
    timeout: number;
}

const DEFAULT_OPTIONS: Options = {
    timeout: 2 * 60 * 1000
}

export default class Crawler {
    // @ts-ignore
    private browser: Browser;
    //@ts-ignore
    private page: Page;

    private options: Options = DEFAULT_OPTIONS;

    private qqNum: string = "";

    constructor(private cookies: Cookie[], options: Options = DEFAULT_OPTIONS) {
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options
        }
    }

    async start() {
        try {
            const result = await startWithTimeout(() => this.innerStart(), {
                timeout: this.options.timeout,
                errMsg: "执行失败"
            })
            return result;

        } catch (err: any) {
            throw err;
        }
        finally {
            if (this.page && !this.page.isClosed) {
                await this.page.close();
            }
            if (this.browser && this.browser.connected) {
                await this.browser.close();
            }
        }
    }

    async innerStart() {
        const result: any = {
            success: false,
            data: {
                list: [],
            }
        };

        try {

            // 准备
            await this.prepare();


            this.getAlbumList();


            await delay(5 * 60 * 1000);


            result.success = true;

            return result;
        } catch (err: any) {
            result.message = err && err.message || '未知异常'
            return result;
        }
    }


    async prepare() {

        logger.log("实例化浏览器：开始");
        const options = getLaunchOptions();
        this.browser = await pup.createBrowser(options);
        logger.log("实例化浏览器：完毕");

        // 设置cookie
        logger.log("设置cookie: 开始");
        await this.browser.setCookie(...this.cookies);
        logger.log("设置cookie: 完毕");



        logger.log("实例化page:开始");
        const page = await this.browser.newPage();
        logger.log("实例化page: 完毕");
        this.page = page;

        // 检查登录
        logger.log("检查登陆状态: 开始");


        const cQQNum = this.cookies.find((c => c.name === 'ptui_loginuin'));
        if (!cQQNum) throw new Error("未找到qq号码")

        this.qqNum = cQQNum.value;

        await checkLogin(page, `${HOME_URL}/${cQQNum.value}`);
        logger.log("检查登陆状态: 完毕");
    }




    private async getAlbumListApiUrl() {

        // // 点击相册
        // this.page.evaluate(() => {
        //     const item: Element | undefined = Array.from(document.querySelectorAll(".head-nav-menu li")).find(el => el.textContent!.includes("相册"));
        //     item && (item as HTMLLIElement).click();
        // });



        this.page.goto(`https://user.qzone.qq.com/${this.qqNum}/4`)

        const res = await this.page.waitForResponse((res) => {
            const url = res.url();
            if (url.startsWith(API_URLS.fcg_list_album_v3)) {
                return true;
            }
            return false;
        });

        return res.url();
    }


    async getAlbumList() {
        const apiUrl = await this.getAlbumListApiUrl();
        console.log("apiUrl:", apiUrl);

    }


}