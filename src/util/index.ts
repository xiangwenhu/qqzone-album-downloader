
import _ from "lodash";
import path from "path";
import fs from "fs";

export function delay(delay: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, delay);
    })
}

export function getDayStartTicket(date: string | number | Date) {
    const d = new Date(date);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return dayStart.getTime();
}


export function uniqueArray<T = any>(arr: T[] = [], key: keyof T): T[] {
    if (typeof key !== "string") {
        return arr;
    }
    const map = new Map();
    let keyVal;
    return arr
        .map((item) => {
            keyVal = _.get(item, key);
            if (!map.has(keyVal)) {
                map.set(keyVal, 1);
                return item;
            }
            return undefined as any;
        })
        .filter(Boolean);
}


export function arrayToMap<T extends Record<string, any>>(arr: T[] = [], key: keyof T): Record<string, T> {

    return arr.reduce((obj: Record<string, T>, cur) => {
        obj[cur[key]] = cur;
        return obj

    }, {} as Record<string, T>)
}


export function startWithTimeout<T>(task: () => Promise<T>, options: {
    timeout: number;
    errMsg: string;
}): Promise<T> {
    return new Promise(async (resolve, reject) => {
        // 超时
        const timeout = setTimeout(() => {
            reject(options.errMsg);
        }, options.timeout);

        try {
            const res = await task();
            clearTimeout(timeout);
            // 正常返回
            resolve(res);
        } catch (err: any) {
            // 异常
            reject(err)
        }
    })
}

/**
 * 同步读取JSON文件内容并解析为对象
 * @param filePath - JSON文件的路径
 * @returns 解析后的JSON对象
 */
export function readJSONSync(filePath: string): any {
    const fullPath = path.resolve(filePath);
    try {
        // 读取文件内容
        const data = fs.readFileSync(fullPath, 'utf8');
        // 将文件内容解析为JSON对象
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading JSON file:', err);
        throw err; // 重新抛出错误以便调用者处理
    }
}