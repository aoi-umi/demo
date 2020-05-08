import { Context, Next } from 'koa';
import { myRequestHandler } from '@/helpers';

type MyRequestHandlerOpt = {
    json?: boolean;
    noSend?: boolean;
    sendAsFile?: boolean;
    originRes?: boolean;
}

export interface MyRequestHandler {
    (opt: MyRequestHandlerOpt, ctx: Context, next?: Next): any;
}

export class MyRequestHandlerMid {
    static convert(fn: MyRequestHandler) {
        let rh = async (ctx, next) => {
            await myRequestHandler(async (opt) => {
                let rs = await fn(opt, ctx, next);
                return rs;
            }, ctx, next);
        };
        return rh;
    }
}