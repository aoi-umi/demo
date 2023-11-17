const axios = require("axios").default;
const fs = require("fs");
const path = require("path");

const utils = require("./utils");

const analyzerEnum = {
  花瓣: "huaban",
  nyahentai: "nyahentai",
  nhentai: "nhentai",
  "3hentai": "3hentai",
};
exports.analyzerEnum = analyzerEnum;
class Download {
  static async run({ url, type, dir, retry } = opt) {
    let outDir = "out";
    let dirName = url.replace(/http(s)?:\/\//, "").replace(/\//g, "_");
    // let exec = /^http(s)?:\/\/[^\/]+/.exec(url);
    let { analyzer, usePuppeter } = this.getAnalyzer(type, url);
    let requestOpt = { usePuppeter };
    let urlRs = await utils.loadUrl(url, requestOpt);
    let rs = await analyzer({ ...urlRs, requestOpt });

    if (!rs || !rs.list.length) {
      console.log("无下载内容");
      return;
    }

    if (dir) dirName = dir;
    else if (rs.title) dirName = rs.title;

    //替换特殊符号
    dirName = dirName.replace(/[\\\/\<\>\?\*\|"\:]/g, "");
    outDir = path.join(outDir, dirName);
    utils.mkdir(outDir);
    let retryTimes = parseInt(retry);
    if (isNaN(retryTimes) || retryTimes <= 0) retryTimes = 0;

    while (true) {
      let saveRs = await this.save(outDir, rs.list, requestOpt);
      if (saveRs.finished) break;
      if (retry === true);
      else if (retryTimes === 0) break;
      else retryTimes--;
    }
    await utils.closePuppeteer();
  }

  static async save(dir, list, requestOpt) {
    let rs = {
      total: 0,
      success: 0,
      exists: 0,
      finished: false,
    };
    rs.total = list.length;
    let puppeteerPage;
    for (let links of list) {
      if (!(links instanceof Array)) {
        links = [links];
      }
      let exists = links.find((ele) => {
        let filename = path.join(dir, ele.filename);
        return fs.existsSync(filename);
      });
      if (exists) {
        rs.exists++;
        continue;
      }
      for (let ele of links) {
        try {
          console.log(`下载[${ele.url}]`);
          let filename = path.join(dir, ele.filename);
          let { data, page } = await utils.request(ele.url, {
            ...requestOpt,
            pageNotClose: true,
            file: true,
            page: puppeteerPage,
          });
          puppeteerPage = page;
          fs.writeFileSync(filename, data);
          rs.success++;
          break;
        } catch (e) {
          console.log(e.message);
        }
      }
    }
    if (puppeteerPage) {
      await puppeteerPage.close();
    }
    let rest = rs.total - (rs.success + rs.exists);
    console.log(
      `下载结果: 成功:${rs.success}/已存在:${rs.exists}/总数:${rs.total}/剩余:${rest}`
    );
    rs.finished = rest === 0;
    return rs;
  }

  static getAnalyzer(analyzerType, url) {
    let analyzer;
    let usePuppeter = false;
    if (!analyzerType) {
      if (/huaban.com/.test(url)) analyzerType = analyzerEnum.花瓣;
      else if (/nyahentai|qqhentai|bughentai/.test(url))
        analyzerType = analyzerEnum.nhentai;
      else if (/3hentai.net/.test(url)) analyzerType = analyzerEnum["3hentai"];
      else if (/nhentai/.test(url)) {
        analyzerType = analyzerEnum.nhentai;
        usePuppeter = true;
      }
    }
    if (analyzerType) {
      let analyzerPath = path.resolve(
        __dirname,
        "analyzer",
        `${analyzerType}.js`
      );
      if (fs.existsSync(analyzerPath)) analyzer = require(analyzerPath).default;
    }

    if (!analyzer) throw new Error("无对应解析器");
    return { analyzer, usePuppeter };
  }
}

exports.Download = Download;
