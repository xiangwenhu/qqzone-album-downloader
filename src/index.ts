import path from "path";
import { readJSONSync } from "./util";
import Crawler from "./crawler";
import { existsSync } from "fs";
import logger from "./logger";

; (async function () {
    try {
        const cookiePath = path.join(__dirname, "../data/cookie.json");

        if (!existsSync(cookiePath)) {
            throw new Error(`缺少 ${cookiePath} 文件`)
        }

        const cookies = readJSONSync(cookiePath);

        const crawler = new Crawler(cookies);

        const res = await crawler.start();

        logger.log("下载完毕");

    } catch (err: any) {
        logger.error(err && err.message || '未知异常');
    }

})()






