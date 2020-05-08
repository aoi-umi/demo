import * as Koa from "koa";
import * as multer from "@koa/multer";

export class FileMid {
    static async single(ctx: Koa.Context, next) {
        try {
            await multer().single('file')(ctx, next);
            await next();
        } catch (e) {
            ctx.body = {
                result: false,
                msg: '缺少参数'
            };
        }
    }
}