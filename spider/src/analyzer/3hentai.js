const cheerio = require("cheerio");
const utils = require("../utils");

exports.default = async function fn({ html, origin }) {
  let $ = cheerio.load(html);

  let title = $("#main-info h2").text() || $("#main-info h1").text();
  if (title) title = title.trim();
  let list = [];

  let reg = /(?<name>\d+)t\.(?<ext>[\w]+)$/;
  $(`#thumbnail-gallery img`).each(function (idx, ele) {
    let dom = $(this);
    let src = dom.attr("data-src");
    if (!src) return true;
    let exec = reg.exec(src);
    if (!exec) return true;
    list.push([
      {
        url: src.replace(reg, `$<name>.${exec.groups.ext}`),
        filename: exec[1] + `.${exec.groups.ext}`,
      },
    ]);
  });
  return { list, title };
};
