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
  let protacol = origin.split(":")[0];

  let host = utils.getUrlHost(fpSrc);
  if (!host.startsWith(protacol)) host = protacol + ":" + host;
  let reg = /(\d+)t(\.(?<ext>[\w]+)){1,}$/;
  $(`#thumbnail-container img`).each(function (idx, ele) {
    let dom = $(this);
    let src = dom.attr("data-src") || dom.attr("src");
    if (!src) return true;
    src = utils.replaceHost(src, host);
    let exec = reg.exec(src);
    if (!exec) return true;
    let ext = exec.groups.ext;
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
