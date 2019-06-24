import { Server } from 'http';
import { SocketOnConnect } from '../typings/libs';

export let io: SocketIO.Server = null;
export let init = function (optIO: SocketIO.Server, onConnect?: SocketOnConnect) {
    io = optIO;
    io.on('connection', function (socket: Socket) {
        onConnect && onConnect(socket, io);
    });
    return io;
};

export function tryFn(socket: Socket, fn: () => void) {
    try {
        fn();
    } catch (e) {
        console.error(e.message);
        socket.emit('err', e.message);
    }
}