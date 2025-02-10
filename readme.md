## 用途
下载QQ空间的相册照片。


## 起因
[旅行者](https://github.com/xiangwenhu/traveler) 记录旅行，但是之前很多旅行照片是保存在QQ空间的。


## 依赖
* node > 20.0.0


## 使用
1. `git clone https://github.com/xiangwenhu/qqzone-album-downloader`
2. cd `qqzone-album-downloader` 
3. `npm install`
4. 登录 `https://user.qzone.qq.com/` 获取cookie
5. 在`qqzone-album-downloader`的目录下，新建 `cookie.json`, 写入上一步获取的cookie值。
6. `npm run start`



## 可配置参数
`src\config\prod.json` 有可配置参数
```json
{
    // 照片保存目录
    "distDir": "D:\\data\\qqzone",
    // chrome浏览器启动程序的位置
    "chrome": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
}
```