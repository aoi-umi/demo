import { Request, Response, NextFunction, RequestHandler } from 'express';
import { myRequestHandler } from '@/helpers';

type MyRequestHandlerOpt = {
    json?: boolean;
    noSend?: boolean;
    sendAsFile?: boolean;
    originRes?: boolean;
}

export interface MyRequestHandler {
    (opt: MyRequestHandlerOpt, req: Request, res: Response, next?: NextFunction): any;
}

export class MyRequestHandlerMid {
    static convert(fn: MyRequestHandler) {
        let rh: RequestHandler = (req, res, next) => {
            myRequestHandler(async (opt) => {
                let rs = await fn(opt, req, res, next);
                return rs;
            }, req, res, next);
        };
        return rh;
    }
}