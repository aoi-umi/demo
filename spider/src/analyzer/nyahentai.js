const cheerio = require('cheerio');
const utils = require('../utils')

async function nyahentai({ html, origin }) {
    let $ = cheerio.load(html);
    let list = [];
    let href = $(`#cover a`).attr('href')
    let firstPage = origin + href
    let fpRs = await utils.loadUrl(firstPage);
    let fp$ = cheerio.load(fpRs.html);
    // console.log(fp$)
    let fpSrc = fp$(fp$('#image-container img')[0]).attr('src')
    
    let host = utils.getUrlHost(fpSrc)
    $(`#thumbnail-container img`).each(function (idx, ele) {
        let dom = $(this);
        let src = dom.attr('data-src');
        let reg = /(\d+)t\.([\w]+)$/;
        if (src) {
            src = utils.replaceHost(src, host);
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
    let title = $('#info h1').text();
    if (title)
        title = title.trim();
    return { list, title };
}

exports.default = nyahentai;