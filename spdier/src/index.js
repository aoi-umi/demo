const axios = require('axios').default;
const fs = require('fs');
const cheerio = require('cheerio');

class Spdier {
    async run(url) {
        let dir = 'out';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync('out');
        }
        let rs = await axios.get(url);
        let html = rs.data;
        let out = this.huaban(html);
        console.log(out);
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
                .map(ele => `http://img.hb.aicdn.com/${ele.file.key}`);
        }
        // console.log(rs);
        return rs;
    }
}

let inst = new Spdier();

let url = 'https://huaban.com/boards/30054730/';
inst.run(url).catch(e => {
    console.error(e);
});