const cheerio = require("cheerio");
const utils = require("../utils");

exports.default = async function nyahentai({ html, origin, requestOpt }) {
  let $ = cheerio.load(html);
  let title = $("#info h1").text();
  if (title) title = title.trim();

  let list = [];
  let href = $(`#thumbnail-container a:first`).attr("href");
  let firstPage = origin + href;
  let fpRs = await utils.loadUrl(firstPage, requestOpt);
  let fp$ = cheerio.load(fpRs.html);
  // console.log(fp$)
  let fpSrc = fp$(fp$("#image-container img")[0]).attr("src");

  let host = utils.getUrlHost(fpSrc);
  $(`#thumbnail-container img`).each(function (idx, ele) {
    let dom = $(this);
    let src = dom.attr("data-src");
    let reg = /(\d+)t\.([\w]+)$/;
    if (src) {
      src = utils.replaceHost(src, host);
      let exec = reg.exec(src);
      if (exec) {
        let exts = ["jpg", "png"];
        if (exec[2] == "png") exts = ["png", "jpg"];
        list.push(
          exts.map((ext) => {
            return {
              url: src.replace(reg, "$1." + ext),
              filename: exec[1] + "." + ext,
            };
          })
        );
      }
    }
  });
  return { list, title };
};
