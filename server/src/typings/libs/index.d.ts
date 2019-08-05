
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
            user: LoginUser;
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

        interface Response {
        }
    }
}


import { Server } from 'http';
import { LoginUser } from '../../models/login-user';
type SocketOnConnect = (socket: Socket, io: SocketIO.Server) => void;