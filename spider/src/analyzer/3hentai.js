const cheerio = require('cheerio');
const utils = require('../utils')

exports.default = async function fn({ html, origin }) {
  let $ = cheerio.load(html);

  let title = $('#main-info h1').text();
  if (title)
    title = title.trim();
  let list = [];

  $(`#thumbnail-gallery img`).each(function (idx, ele) {
    let dom = $(this);
    let src = dom.attr('data-src');
    let reg = /(?<name>\d+)t\.(?<ext>[\w]+)$/;
    if (src) {
      let exec = reg.exec(src);
      if (exec) {
        list.push([{
          url: src.replace(reg, `$<name>.${exec.groups.ext}`),
          filename: exec[1] + `.${exec.groups.ext}`,
        }]);
      }
    }
  });
  return { list, title };
}