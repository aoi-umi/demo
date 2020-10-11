const cheerio = require('cheerio');

async function nyahentai(html) {
    let $ = cheerio.load(html);
    let list = [];
    $(`#thumbnail-container img`).each(function (idx, ele) {
        let dom = $(this);
        let src = dom.attr('data-src');
        let reg = /(\d+)t\.([\w]+)$/;
        if (src) {
            [{
                search: 'mt.404cdn.com',
                replace: 'mi.404cdn.com',
            }, {
                search: 't.nyahentai.net',
                replace: 'i.nyahentai.net',
            }, {
                search: 't1.nyacdn.com',
                replace: 'i0.nyacdn.com',
            }].forEach(ele => {
                src = src.replace(ele.search, ele.replace);
            });
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