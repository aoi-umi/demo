
//后端
import 'express';
import { LoginUser } from '../../models/login-user';

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
import { MySocket } from '../../_system/socket';
type SocketOnConnect = (socket: Socket, mySocket: MySocket) => void;