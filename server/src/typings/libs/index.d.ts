
//后端
import 'express';

declare global {
    namespace Express {
        interface Request {
            myData: MyData;
            _parsedUrl: {
                pathname: string;
            },
            _parsedOriginalUrl: {
                pathname: string;
            }
        }

        interface MyData {
            method: {
                methodName?: string
            };
            user: MyDataUser;
            viewPath?: string;
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
            _id: string;
            nickname: string;
            account: string;
            authority: { [key: string]: boolean };
            key?: string;
            cacheDatetime?: string;
            token?: string;
            reqBody?: any;
        }

        interface Response {
        }
    }
}


import { Server } from 'http';
type SocketOnConnect = (socket: Socket, io: SocketIO.Server) => void;