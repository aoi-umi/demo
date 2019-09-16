import { SocketOnConnect } from '@/typings/libs';
import { SocketUser } from '@/models/socket-user';

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
    constructor(optIO: SocketIO.Server, onConnect?: SocketOnConnect) {
        this.io = optIO;
        this.socketUser = new SocketUser();
        this.io.on('connection', (socket: Socket) => {
            onConnect && onConnect(socket, this);
        });
    }
}