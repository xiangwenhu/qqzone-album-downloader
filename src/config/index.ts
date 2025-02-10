import path from "path";

type ENV = "dev" | "prod";

export const env: ENV = (process.env.NODE_ENV || 'prod') as ENV;

console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
console.log("env:", env);

export const IsDev = env === "dev";
export const IsProd = env === "prod";

interface Config {
    distDir: string;
    chrome: string;
}

const config: Config = require(path.join(__dirname, `./${env}.json`));

export default config;