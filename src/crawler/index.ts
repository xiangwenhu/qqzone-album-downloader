import { Browser, Cookie, Page, Protocol } from "puppeteer-core";
import logger from "../logger";
import * as pup from "../puppeteer";
import { arrayToMap, delay, startWithTimeout, uniqueArray, writeJSONFile } from "../util";
import { checkLogin } from "./util";
import { getLaunchOptions } from "../puppeteer/const";
import { API_URLS, HOME_URL } from "../const";
import qs from "query-string";
import { AlbumItem, ResData } from "./types";
import path from "path";

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

    private commonInfo: {
        qqNum: string;
        g_tk: string;
    } = {
            qqNum: "",
            g_tk: ""
        }

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


            const albumList = await this.getAlbumList();

            writeJSONFile(path.join(__dirname, "../../data/album.json"), albumList);


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

        this.commonInfo.qqNum = cQQNum.value;

        await checkLogin(page, `${HOME_URL}/${cQQNum.value}`);
        logger.log("检查登陆状态: 完毕");
    }




    private async getAlbumListApiUrl() {

        // // 点击相册
        // this.page.evaluate(() => {
        //     const item: Element | undefined = Array.from(document.querySelectorAll(".head-nav-menu li")).find(el => el.textContent!.includes("相册"));
        //     item && (item as HTMLLIElement).click();
        // });

        this.page.goto(`https://user.qzone.qq.com/${this.commonInfo.qqNum}/4`)

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


        let hasNextPage = true;
        let total = 0;
        let pageStart = 0;
        const pageSize = 30;

        const items: AlbumItem[] = [];
        while (hasNextPage) {

            const fullUrl = this.buildAlbumListApiUrl(apiUrl, pageStart)

            const res: ResData = await this.page.evaluate((url) => {
                return fetch(url).then(r => r.json())
            }, fullUrl);

            if (res.code != 0) throw new Error(res.message);

            const albumList: AlbumItem[] = res.data.albumListModeSort || res.data.albumList || [];

            items.push(...albumList);

            total = res.data.albumsInUser;

            // 获取的数量大于等于30
            hasNextPage = albumList.length >= pageSize;

            pageStart += pageSize;

        }

        return items;

    }


    private buildAlbumListApiUrl(url: string, pageStart: number) {

        const qsObj = qs.parse(url.split("?")[1]);
        qsObj["format"] = "json";
        qsObj["pageStart"] = `${pageStart}`;
        const qsStr = qs.stringify(qsObj);

        return `${API_URLS.fcg_list_album_v3}?${qsStr}`
    }



    private async getAlbumPhotos(item: AlbumItem) {

        const qsObj = {
            g_tk: "1058931421",
            topicId: item.id,
            idcNum: 4,
            mode: 2,
            pageNum: 50,
            noTopic: 0,
            sortOrder: 6,
            hostUin: this.commonInfo.qqNum,
            uin: this.commonInfo.qqNum,
            inCharset: "gbk",
            outCharset: "gbk",
            notice: 0,
            source: "qzone",
            plat: "qzone",
            format: "json",
            appid: 4,
            pageStart: 0
        }



        const res = await this.page.waitForResponse((res) => {
            const url = res.url();
            if (url.startsWith(API_URLS.fcg_list_album_v3)) {
                return true;
            }
            return false;
        });
    }


    private downloadAlbum(item: AlbumItem) {


    }


}