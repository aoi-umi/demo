import { SocketOnConnect } from '@/typings/libs';
import { SocketUser } from '@/models/socket-user';
import { myEnum } from '@/config';

export function tryFn(socket: Socket, fn: () => void) {
    try {
        fn();
    } catch (e) {
        console.error(e.message);
        socket.emit('err', e.message);
    }
}

export class MySocket {
    io: SocketIO.Server;
    socketUser: SocketUser;
    authObj: { [key: string]: Socket } = {};
    constructor(optIO: SocketIO.Server, onConnect?: SocketOnConnect) {
        this.io = optIO;
        this.socketUser = new SocketUser();
        this.io.on('connection', (socket: Socket) => {
            onConnect && onConnect(socket, this);
        });
    }

    authRecv(token: string, data) {
        let socket = this.authObj[token];
        if (socket) {
            socket.emit(myEnum.socket.授权接收, data);
            delete this.authObj[token];
            return true;
        }
        return false;
    }
}