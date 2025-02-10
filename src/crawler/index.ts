import { Browser, Cookie, Page, Protocol } from "puppeteer-core";
import logger from "../logger";
import * as pup from "../puppeteer";
import { arrayToMap, delay, readJSONSync, startWithTimeout, uniqueArray, writeJSONFile } from "../util";
import { checkLogin } from "./util";
import { getLaunchOptions } from "../puppeteer/const";
import { API_URLS, HOME_URL } from "../const";
import qs from "query-string";
import { AlbumItem, PhotoItem, ResData } from "./types";
import path from "path";
import config from "../config";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { downloadFileWithRetry } from "../util/loader";

interface Options {
}

const DEFAULT_OPTIONS: Options = {
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
            await this.innerStart()
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
        // 准备
        await this.prepare();

        // 通过拦截请求，获取获取相册的请求api地址
        logger.log("获取相册API地址: 开始");
        const apiUrl = await this.getAlbumListApiUrl();
        console.log("apiUrl:", apiUrl);
        logger.log("获取相册API地址: 完毕");

        // 通过url反向解析获取通用参数
        logger.log("通过url反向解析获取通用参数: 开始");
        this.getCommonQueryInfo(apiUrl);
        logger.log("通过url反向解析获取通用参数: 完毕");

        // 相册信息，如果有缓存读取缓存
        logger.log("获取相册信息: 开始");
        let albums: AlbumItem[] = [];
        const albumPath = path.join(__dirname, "../../data/album.json");

        logger.log("检查是否有缓存相册信息");
        if (existsSync(albumPath)) {
            logger.log("检查是否有缓存相册信息: 本地有缓存，从本地读取");
            albums = readJSONSync(albumPath);
        } else {
            logger.log("检查是否有缓存相册信息: 本地无缓存，从网络获取");
            albums = await this.getAlbumList(apiUrl);

            logger.log("缓存相册信息到本地: 开始");
            writeJSONFile(albumPath, albums);
            logger.log("缓存相册信息到本地: 完毕");
        }
        logger.log(`获取相册信息: 完毕, 总数${albums.length}`);

        await this.downloadAlbumList(albums);
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



        logger.log("实例化page: 开始");
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



    private getCommonQueryInfo(url: string) {
        const qsObj = qs.parse(url.split("?")[1]);
        this.commonInfo.g_tk = qsObj.g_tk as string || "";
    }


    async getAlbumList(apiUrl: string) {

        let hasNextPage = true;
        let total = 0;
        let pageStart = 0;
        const pageSize = 30;

        const items: AlbumItem[] = [];
        logger.log("网络获取相册信息: 开始");
        while (hasNextPage) {

            const fullUrl = this.buildAlbumListApiUrl(apiUrl, pageStart);

            logger.log(`网络获取相册信息 ${pageStart} - ${pageStart + pageSize}: 开始`);
            const res: ResData = await this.page.evaluate((url) => {
                return fetch(url).then(r => r.json())
            }, fullUrl);
            logger.log(`网络获取相册信息 ${pageStart} - ${pageStart + pageSize}: 完毕`);

            if (res.code != 0) throw new Error(res.message);

            const albumList: AlbumItem[] = res.data.albumListModeSort || res.data.albumList || [];

            items.push(...albumList);

            total = res.data.albumsInUser;

            // 获取的数量大于等于30  ||  总数已经大于 total
            hasNextPage = albumList.length >= pageSize || items.length < total;
            logger.log(`网络获取相册信息 总数 ${total}, 是否还有下一页 ${hasNextPage}`);


            pageStart += pageSize;

        }
        logger.log("网络获取相册信息: 完毕");
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

        logger.log("获取相册照片：开始");
        const pageNum = 50;
        let pageStart = 0;
        let hasNextPage = true;

        const qsObj = {
            g_tk: this.commonInfo.g_tk,
            topicId: item.id,
            idcNum: 4,
            // 照片模式，2是旅行？
            mode: 0,
            pageNum,
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
            pageStart
        }


        let photos: PhotoItem[] = [];
        let total: number = 0;
        while (hasNextPage) {

            const query = qs.stringify(qsObj);
            const fullUrl = `${API_URLS.cgi_list_photo}?${query}`;

            logger.log(`网络获取相册照片信息 ${pageStart} - ${pageStart + pageNum}: 开始`);
            const res: ResData = await this.page.evaluate((url) => {
                return fetch(url).then(r => r.json())
            }, fullUrl);
            logger.log(`网络获取相册照片信息 ${pageStart} - ${pageStart + pageNum}: 完毕`);
            total = res.data.totalInAlbum || 0;


            const photoList: PhotoItem[] = res.data.photoList || [];

            photos.push(...photoList);

            hasNextPage = photoList.length >= pageNum || photos.length < total;

            logger.log(`网络获取相册照片信息 总数 ${total}, 是否还有下一页 ${hasNextPage}`);
            qsObj.pageStart += pageNum;

        }
        logger.log("获取相册照片：完毕");
        return photos;

    }


    private async downloadAlbum(item: AlbumItem) {

        const dir = path.join(config.distDir, item.name);
        if (existsSync(dir)) return logger.log(`相册目录 ${dir} 已存在，跳过`);


        logger.log(`获取相册 ${item.name}  照片信息: 开始`);
        const photos: PhotoItem[] = await this.getAlbumPhotos(item);
        logger.log(`获取相册 ${item.name}  照片信息: 完毕`);

        logger.log(`相册 ${item.name} 照片数量 ${photos.length}`);

        await mkdir(dir, { recursive: true })

        logger.log(`相册 ${item.name} 下载照片: 开始`);


        for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            logger.log(`相册 ${item.name} 下载照片 ${i + 1}/${photos.length}: 开始`);

            let fullDist = path.join(dir, `${photo.name}.png`);

            if (existsSync(fullDist)) {
                fullDist = path.join(dir, `${randomUUID()}-${photo.name}.png`);
            }

            await downloadFileWithRetry(photo.url, fullDist);
            logger.log(`相册 ${item.name} 下载照片 ${i + 1}/${photos.length}: 完毕`);
        }

        logger.log(`相册 ${item.name} 下载照片: 完毕`);
    }


    private async downloadAlbumList(items: AlbumItem[]) {

        logger.log("下载相册照片: 开始");
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            logger.log(`下载相册 ${item.name}: 开始`);
            try {
                await this.downloadAlbum(item);
            } catch (err: any) {
                logger.log(`下载相册 ${item.name} 失败：${err && err.message}`);
            }
            logger.log(`下载相册 ${item.name}: 完毕`);
        }
        logger.log("下载相册照片: 完毕");
    }
}