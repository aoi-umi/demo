
//后端
import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            myData: {
                method: {
                    methodName?: string
                };
                user: {
                    id: number;
                    nickname: string;
                    account: string;
                    authority: { [key: string]: boolean };
                };
                viewPath: string;
                noNav?: boolean;
				autoSignIn?: boolean;
				noLog?: boolean;
                startTime: number;
                useStatus?: boolean;
                accessableUrl: { [url: string]: boolean };
                ip: string;
            };
            _parsedUrl: {
                pathname: string;
            }
        }

        interface Response {
            mySend(err, detail?, opt?);

            myRender(view: string, options?: Object): void;
        }
    }
}