import * as Koa from "koa";
import { RouterContext } from "@koa/router";
import * as multer from "@koa/multer";

export class FileMid {
    static async single(ctx: Koa.Context & RouterContext, next) {
        try {
            await multer().single('file')(ctx, next);
            await next();
        } catch (e) {
            ctx.body = {
                result: false,
                msg: e.message
            };
        }
    }
}