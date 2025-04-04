const cheerio = require("cheerio");
const utils = require("../utils");

exports.default = async function nyahentai({ html, origin, requestOpt }) {
  let $ = cheerio.load(html);
  let title = $("#info .title:last").text();
  if (title) title = title.trim();

  let list = [];
  let href = $(`#thumbnail-container a:first`).attr("href");
  if (!href) return;
  let firstPage = origin + href;
  let fpRs = await utils.loadUrl(firstPage, requestOpt);
  let fp$ = cheerio.load(fpRs.html);
  // console.log(fp$)
  let fpSrc = fp$(fp$("#image-container img")[0]).attr("src");

  let host = utils.getUrlHost(fpSrc);
  let reg = /(\d+)t\.([\w]+)$/;
  $(`#thumbnail-container img`).each(function (idx, ele) {
    let dom = $(this);
    let src = dom.attr("data-src");
    if (!src) return true;
    src = utils.replaceHost(src, host);
    let exec = reg.exec(src);
    if (!exec) return true;
    let ext = exec[2];
    let exts = ["jpg", "png"];
    if (ext == "png") exts = ["png", "jpg"];
    if (!exts.includes(ext))
      exts.unshift(ext);

    list.push(
      exts.map((ext) => {
        return {
          url: src.replace(reg, "$1." + ext),
          filename: exec[1] + "." + ext,
        };
      })
    );
  });
  return { list, title };
};
