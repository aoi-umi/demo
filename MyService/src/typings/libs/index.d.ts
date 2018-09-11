
//后端
import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            myData: MyData;
            _parsedUrl: {
                pathname: string;
            }
        }

        interface MyData {
            method: {
                methodName?: string
            };
            user: MyDataUser;
            viewPath: string;
            noNav?: boolean;
            autoSignIn?: boolean;
            noLog?: boolean;
            startTime: number;
            useStatus?: boolean;
            accessableUrl: { [url: string]: boolean };
            ip: string;
            lang?: string;
        }

        interface MyDataUser {
            id: number;
            nickname: string;
            account: string;
            authority: { [key: string]: boolean };
            key?: string;
            cacheDatetime?: string;
            token?: string;
            reqBody?: any;
        }

        interface Response {
            mySend(err, detail?, opt?);

            myRender(view: string, options?: Object): void;
        }
    }
}