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
        errorDefault: { type: "logLevelFilter", level: "error", appender: "errorLog" },
        allScheduleLog:{
            type: "dateFile",
            filename: `${logPath}schedule-allLog.log`,
            pattern: "yyyy-MM-dd",
            alwaysIncludePattern: true,
            numBackups: 7,
            keepFileExt: true
        },
        errorScheduleLog: {
            type: "dateFile",
            pattern: "yyyy-MM-dd",
            filename: `${logPath}schedule-error.log`,
            alwaysIncludePattern: true,
            numBackups: 7,
            keepFileExt: true
        },
        errorSchedule: { type: "logLevelFilter", level: "error", appender: "errorScheduleLog" },
    },
    categories: {
        default: { appenders: ["out", "allLog", "errorDefault"], level: "debug" },
        schedule: { appenders: ["out", "allScheduleLog", "errorSchedule"], level: "debug" },
    }
});

const logger = log4js.getLogger("default");

export const scheduleLogger = log4js.getLogger("schedule");

export default logger;