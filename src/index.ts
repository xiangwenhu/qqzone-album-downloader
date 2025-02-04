import path from "path";
import { readJSONSync } from "./util";
import Crawler from "./crawler";

const cookieFilename = path.join(__dirname, "../data/cookie.json");

const cookies = readJSONSync(cookieFilename);

const crawler = new Crawler(cookies);


crawler.start().then(res=> {
    console.log("Res:" , res);
}).catch(err=> {
    console.log("error:", err)
});
