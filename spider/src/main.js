const axios = require('axios').default;
const fs = require('fs');
const path = require('path');

const huaban = require('./analyzer/huaban').default;
const nyahentai = require('./analyzer/nyahentai').default;

const analyzerEnum = {
    花瓣: 'huaban',
    nyahentai: 'nyahentai'
};
exports.analyzerEnum = analyzerEnum;
function mkdir(dir) {
    if (!fs.existsSync(dir)) {
        console.log('创建文件夹', dir);
        fs.mkdirSync(dir, { recursive: true });
    }
}
class Download {
    static async load(url) {
        console.log(`url: ${url}`);
        console.log('load url start');
        let rs = await axios.get(url);
        let html = rs.data;
        console.log('load url end');
        return html;
    }

    static async run(url, analyzerType) {
        let dir = 'out';
        let dirName = url.replace(/http(s)?:\/\//, '').replace(/\//g, '_');
        // let exec = /^http(s)?:\/\/[^\/]+/.exec(url);
        let html = await this.load(url);
        let analyzer = this.getAnalyzer(analyzerType, url);
        let rs = await analyzer(html);

        if (!rs.list.length)
            console.log('无下载内容');
        else {
            if (rs.title)
                dirName = rs.title;

            //替换特殊符号
            dirName = dirName.replace(/[\\\/\<\>\?\*\|"\:]/g, '');
            dir = path.join(dir, dirName);
            mkdir(dir);
            await this.save(dir, rs.list);
        }
    }

    static async save(dir, list) {
        let rs = {
            total: 0,
            success: 0,
            exists: 0,
        };
        rs.total = list.length;
        for (let o of list) {
            if (!(o instanceof Array)) {
                o = [o];
            }
            let exists = o.find(ele => {
                let filename = path.join(dir, ele.filename);
                return fs.existsSync(filename);
            });
            if (exists) {
                rs.exists++;
                continue;
            } else {
                for (let ele of o) {
                    try {
                        console.log(`下载[${ele.url}]`);
                        let filename = path.join(dir, ele.filename);
                        let res = await axios.get(ele.url, { responseType: 'arraybuffer', timeout: 1000 * 15 });
                        fs.writeFileSync(filename, res.data);
                        rs.success++;
                        break;
                    } catch (e) {
                        console.error(e.message);
                    }
                }
            }
        }
        console.log(`下载结果: 成功:${rs.success}/已存在:${rs.exists}/总数:${rs.total}`);
    }

    static getAnalyzer(analyzerType, url) {
        let analyzer;
        if (!analyzerType) {
            if (/huaban.com/.test(url))
                analyzerType = analyzerEnum.花瓣;
            else if (/nyahentai.pro|nyahentai[\d]*.com/.test(url))
                analyzerType = analyzerEnum.nyahentai;

        }
        switch (analyzerType) {
            case analyzerEnum.花瓣:
                analyzer = huaban;
                break;
            case analyzerEnum.nyahentai:
                analyzer = nyahentai;
                break;
        }
        if (!analyzer)
            throw new Error('无对应解析器');
        return analyzer;
    }
}

exports.Download = Download;
