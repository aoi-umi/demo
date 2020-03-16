const cheerio = require('cheerio');

async function nyahentai(html) {
    let $ = cheerio.load(html);
    let list = [];
    $(`#thumbnail-container img`).each(function (idx, ele) {
        let dom = $(this);
        let src = dom.attr('data-src');
        let reg = /(\d+)t\.([\w]+)$/;
        if (src) {
            src = src.replace('t.nyahentai.net', 'i.nyahentai.net');
            let exec = reg.exec(src);
            if (exec) {
                list.push([{
                    url: src.replace(reg, '$1.jpg'),
                    filename: exec[1] + '.jpg',
                }, {
                    url: src.replace(reg, '$1.png'),
                    filename: exec[1] + '.png',
                }]);
            }
        }
    });
    return list;
}

exports.default = nyahentai;