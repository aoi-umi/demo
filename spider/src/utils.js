const axios = require('axios').default;
const fs = require('fs');
const path = require('path');

const mkdir = exports.mkdir = (dir) => {
    if (!fs.existsSync(dir)) {
        console.log('创建文件夹', dir);
        fs.mkdirSync(dir, { recursive: true });
    }
}

let hostReg = /^(http|https):\/\/(\w+(\.)?)+/;
const getUrlHost = exports.getUrlHost = (url) => {
    let regRs = hostReg.exec(url)
    let host = regRs[0];
    return host
}

exports.replaceHost = (url, newHost) => {
    return url.replace(hostReg, newHost);
}

const loadUrl = exports.loadUrl = async (url) => {
    console.log(`url: ${url}`);
    console.log('load url start');
    let rs = await axios.get(url);
    let origin = getUrlHost(url);
    let html = rs.data;
    console.log('load url end');
    return { html, origin };
}