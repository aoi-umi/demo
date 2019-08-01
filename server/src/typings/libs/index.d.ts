
//后端
import 'express';

declare global {
    namespace Express {
        interface Request {
            myData: MyData;
            _parsedUrl: {
                pathname: string;
            },
            realIp: string;
        }

        interface MyData {
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
            // token?: string;
            loginData?: any;
        }

        interface Response {
        }
    }
}


import { Server } from 'http';
type SocketOnConnect = (socket: Socket, io: SocketIO.Server) => void;