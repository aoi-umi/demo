import { MyRequestHandler } from "@/middleware";
import { env } from "@/config";
import * as common from "@/_system/common";

export const getCode: MyRequestHandler = async (opt, req, res) => {
    let url = 'https://open.weixin.qq.com/connect/oauth2/authorize?'
        + [
            `redirect_uri=${env.host}/wx/auth?getUserInfo=1`,
            `appid=${env.wxOffiaCcount.appId}`,
            `response_type=code&scope=snsapi_userinfo&state=1&connect_redirect=1#wechat_redirect`
        ].join('&');
    return url;
};

type WxErrorType = {
    errcode: string;
    errmsg: string;
};

const getToken = async (data: { code }) => {
    let url = 'https://api.weixin.qq.com/sns/oauth2/access_token?'
        + [
            `appid=${env.wxOffiaCcount.appId}`,
            `secret=${env.wxOffiaCcount.appSecret}`,
            `code=${data.code}`,
            `grant_type=authorization_code`
        ].join('&');
    let rs = await common.requestService({ url, method: 'get' });
    let tokenRs = rs.data as WxErrorType;
    if (tokenRs.errcode)
        throw common.error(tokenRs.errmsg);

    //成功
    //{"access_token":"28_xwVEiF34Hu8aZ9jTurGzUkZWPPaUJzWnJnjZgvuh-O3_yoour18olwNMHhD9q8GxmEdJcvrf8GdNvjLPqvOxfrrvuTfVb15egL2Yei0L8ZU","expires_in":7200,"refresh_token":"28_V45NBOAHzJ2gTKifi8fgupmbXUbMVpL-pTCJKGEIqQik37m-TvMH1wM_0DtFxtrNJ4_mlOc4S4ntymyzd1aTzS6-uygzj9eYZrVcjqBAQLg","openid":"o3EBEt4xoZ35nQrec3eiEgJ-16vg","scope":"snsapi_userinfo"}
    return rs.data as {
        access_token: string;
        expires_in: number;
        refresh_token: string;
        openid: string;
        scope: string;
    };
};

export const getUserInfo: MyRequestHandler = async (opt, req, res) => {
    let data = req.query;
    let tokenRs = await getToken(data);
    let url = `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenRs.access_token}&openid=${tokenRs.openid}`;
    let rs = await common.requestService({ url, method: 'get' });
    let rsData = rs.data as WxErrorType;
    if (rsData.errcode)
        throw common.error(rsData.errmsg);
    //token失效
    //{"errcode":40001,"errmsg":"invalid credential, access_token is invalid or not latest, hints: [ req_id: KhpFn2Dae-jhOqva ]"}
    //{"openid":"o3EBEt4xoZ35nQrec3eiEgJ-16vg","nickname":"umi","sex":1,"language":"zh_CN","city":"","province":"","country":"CG","headimgurl":"http:\/\/thirdwx.qlogo.cn\/mmopen\/vi_32\/tDVFR5S2r4CCjMaBB5USQiaKLSBt9rWIRqoYp8YU5SSsP9ZueChx5Bue4FZV0wZiadgjMZnsPgctKfbkHK7iaJ4CA\/132","privilege":[]}
    let succ = rs.data as {
        openid: string;
        nickname: string;
        sex: number;
        language: string;
        city: string;
        province: string;
        country: string;
        headimgurl: string;
        privilege: any[];
    };
    return succ;
};