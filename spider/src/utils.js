const axios = require("axios").default;
const fs = require("fs");
const path = require("path");
const config = require("config");
const puppeteer = require("puppeteer");
const { dataUriToBuffer } = require("data-uri-to-buffer");
const { HttpsProxyAgent } = require("https-proxy-agent");

const mkdir = (exports.mkdir = (dir) => {
  if (!fs.existsSync(dir)) {
    console.log("创建文件夹", dir);
    fs.mkdirSync(dir, { recursive: true });
  }
});

let hostReg = /^(http|https):\/\/(\w+(\.)?)+/;
const getUrlHost = (exports.getUrlHost = (url) => {
  let regRs = hostReg.exec(url);
  let host = regRs[0];
  return host;
});

exports.replaceHost = (url, newHost) => {
  return url.replace(hostReg, newHost);
};

const loadUrl = (exports.loadUrl = async (url, opt) => {
  console.log(`url: ${url}`);
  console.log("load url start");
  let origin = getUrlHost(url);
  let html = await request(url, opt);
  console.log("load url end");
  return { html, origin };
});

const request = (exports.request = async (url, opt) => {
  opt = { ...opt };
  if (opt.usePuppeter) return byPuppeteer(url, opt);
  return byAxios(url, opt);
});

let agent;
const byAxios = async (url, opt) => {
  let options = {};
  if (opt.file) {
    options = {
      ...options,
      responseType: "arraybuffer",
      timeout: 1000 * 15,
    };
  }
  if (config.proxy) {
    if (!agent) {
      agent = new HttpsProxyAgent(config.proxy, {
        rejectUnauthorized: false,
      });
    }
    options = {
      ...options,
      proxy: false,
      httpsAgent: agent,
      httpAgent: agent,
    };
  }
  let rs = await axios.get(url, options);
  let data = rs.data;
  return data;
};

let browser;
async function byPuppeteer(url, opt) {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false,
      userDataDir: config.puppeteer.userDataDir,
    });
  }
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  let cont;
  if (opt.file) {
    const dataUrl = await page.evaluate(getDataUrlThroughFetch, url);
    cont = Buffer.from(dataUriToBuffer(dataUrl).buffer);
  } else {
    cont = await page.content();
  }
  await page.close();

  return cont;
}

const getDataUrlThroughFetch = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch image, (status ${response.status})`);
  }
  const data = await response.blob();
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.addEventListener("loadend", () => resolve(reader.result));
    reader.readAsDataURL(data);
  });
};

const parseDataURL = (dataUrl) => {
  let arr = dataUrl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return {
    buffer: u8arr,
    mime,
  };
};

// const getImageContent = async (page) => {
//   const client = await page.target().createCDPSession();
//   let filePath = path.resolve(__dirname, "../.dev");
//   await client.send("Page.setDownloadBehavior", {
//     behavior: "allow",
//     downloadPath: filePath,
//   });

//   let f = path.resolve(filePath, "1.png");
//   console.log(f);
//   await waitForFile(f);
//   await client.detach();
// };

exports.closePuppeteer = async () => {
  if (browser) await browser.close();
};

function waitForFile(path) {
  return new Promise(function (resolve, reject) {
    let times = 10;
    let id = setInterval(() => {
      let exists = fs.existsSync(path);
      if (exists) {
        resolve();
        clearInterval(id);
      }
      times--;
      if (!times) {
        reject("time out");
      }
    }, 1 * 1000);
  });
}
