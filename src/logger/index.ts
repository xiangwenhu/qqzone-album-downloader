import * as log4js from "log4js";

const logPath = process.env.LOG_PATH || "/data/www/logs/"

log4js.configure({
    appenders: {
        out: { type: "console" },
        allLog: {
            type: "dateFile",
            filename: `${logPath}allLog.log`,
            pattern: "yyyy-MM-dd",
            alwaysIncludePattern: true,
            numBackups: 7,
            keepFileExt: true
        },
        errorLog: {
            type: "dateFile",
            pattern: "yyyy-MM-dd",
            filename: `${logPath}error.log`,
            alwaysIncludePattern: true,
            numBackups: 7,
            keepFileExt: true
        },
    },
    categories: {
        default: { appenders: ["out", "allLog", "errorDefault"], level: "debug" },
    }
});

const logger = log4js.getLogger("default");

export default logger;