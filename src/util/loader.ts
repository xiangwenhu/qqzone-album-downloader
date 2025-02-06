import axios, { AxiosRequestConfig } from "axios";
import fs from "fs";
import * as retry from "./retry";
import logger from "../logger";

function downloadFile(url: string, dist: string, config: AxiosRequestConfig = {}, timeout = 20 * 1000) {
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(dist, {
            encoding: "utf-8",
            autoClose: true,
            emitClose: true,
        });
        const ticket = setTimeout(() => {
            reject(new Error(`下载 ${url} 超时`))
            writer.close();
        }, timeout);
        axios({
            ...config,
            method: 'get',
            url: url,
            responseType: 'stream',
        }).then(function (res) {
            const data = { url, dist }
            const onFinish = (data: any) => {
                clearTimeout(ticket);
                resolve(data)
            }
            writer.on("finish", () => onFinish(data));
            writer.on("close", () => onFinish(data));
            writer.on("error", reject);
            res.data.pipe(writer);
        }).catch(err => {
            clearTimeout(ticket)
            reject(err);
        })
    })
}


export async function downloadFileWithRetry(url: string, dist: string, retryCount: number = 10, errMsg?: string) {
    const job = () => downloadFile(url, dist, { timeout: 20 * 1000 });

    const res = await retry.retryAsyncJob(job, retryCount, (time: number) => {
        logger.log(`第${time}次下载文件失败：${url}`);
        try {
            if (fs.existsSync(dist)) {
                fs.unlinkSync(dist)
            }
        } catch (err) {
            logger.error(`unlink ${dist} failed`, err);
        }
    }, errMsg)
    return res;
}
