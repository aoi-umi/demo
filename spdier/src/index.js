const axios = require('axios').default;
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function mkdir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}
class Spdier {

    async run(url) {
        let dir = 'out';
        dir = path.join(dir, url.replace(/http(s)?:\/\//, '').replace(/\//g, '_'));
        mkdir(dir);
        let rs = await axios.get(url);
        let html = rs.data;
        let out = this.huaban(html);
        if (!out.length)
            console.log('无下载内容');
        else {
            for (let o of out) {
                try {
                    let filename = path.join(dir, o.filename);
                    if (!fs.existsSync(filename)) {
                        console.log(`下载[${o.url}]`);
                        let rs = await axios.get(o.url, { responseType: 'arraybuffer', });
                        fs.writeFileSync(filename, rs.data);
                    }
                } catch (e) {
                    console.error(`[${o.url}]下载失败:`);
                    console.error(e.message);
                }
            }
        }
    }

    //花瓣
    huaban(html) {
        let $ = cheerio.load(html);
        let out, matchCfg;
        let cfg = [{
            flag: 'app.page["pins"] =',
        }, {
            flag: `app.page["board"] =`,
            resultHandler: (data) => {
                eval('data =' + data);
                return data.pins;
            }
        },];
        $(`script`).each(function (idx, ele) {
            let html = $(this).html();
            if (html) {
                for (let c of cfg) {
                    let m = html.split(/[\r\n]/).find(ele => ele.startsWith(c.flag))
                    if (m) {
                        matchCfg = c;
                        out = m.replace(c.flag, '');
                        break;
                    }
                }
            }
            if (out)
                return false;
        });
        let rs = [];
        if (out) {
            rs = (matchCfg.resultHandler ? matchCfg.resultHandler(out) : eval(out))
                .map(ele => {
                    let suffix = '.' + ele.file.type.replace('image/', '');
                    return {
                        url: `http://img.hb.aicdn.com/${ele.file.key}`,
                        type: ele.type,
                        filename: ele.file.key + suffix,
                    };
                });
        }
        // console.log(rs);
        return rs;
    }
}

let inst = new Spdier();

let url = 'https://huaban.com/boards/30054730';
inst.run(url).catch(e => {
    console.error(e.message);
});