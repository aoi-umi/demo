const cheerio = require('cheerio');

//花瓣
exports.default = async function (html, save) {
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
    let list = [];
    if (out) {
        list = (matchCfg.resultHandler ? matchCfg.resultHandler(out) : eval(out))
            .map(ele => {
                let suffix = '.' + ele.file.type.replace('image/', '');
                return {
                    url: `http://img.hb.aicdn.com/${ele.file.key}`,
                    type: ele.type,
                    filename: ele.file.key + suffix,
                };
            });
    }
    return list;
};