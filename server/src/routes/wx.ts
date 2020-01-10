import { MyRequestHandler } from "@/middleware";
import { wxInst } from "@/3rd-party";

export const getCode: MyRequestHandler = async (opt, req, res) => {
    let rs = wxInst.getCodeUrl();
    return rs;
};

export const getUserInfo: MyRequestHandler = async (opt, req, res) => {
    let data = req.query;
    let rs = await wxInst.getUserInfo(data);
    delete rs.openid;
    return rs;
};