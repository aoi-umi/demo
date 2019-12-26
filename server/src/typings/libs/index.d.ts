
//后端
import 'express';
import { LoginUser } from '../../models/login-user';

declare global {
    namespace Express {
        interface Request {
            myData: MyData;
            myOption: any;
            _parsedUrl: {
                pathname: string;
            },
            realIp: string;
        }

        interface MyData {
            user?: LoginUser;
            autoSignIn?: boolean;
            noLog?: boolean;
            startTime: number;
            useStatus?: boolean;
            ip: string;
            lang?: string;
            imgHost?: string;
            videoHost?: string;
        }

        interface Response {
        }
    }
}


import { Server } from 'http';
import { MySocket } from '../../_system/socket';
type SocketOnConnect = (socket: Socket, mySocket: MySocket) => void;