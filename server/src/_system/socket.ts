import { Server } from 'http';
export let onlineCount = 0;
export let onlineUser = {};
interface Socket extends SocketIO.Socket {
}

export let io: Server = null;
export let init = function (optIO: Server, onConnect?: (socket: Socket) => void) {
    io = optIO;
    io.on('connection', function (socket: Socket) {
        onConnect && onConnect(socket);
        // socket.on('disconnect', function () {

        // });
    });
    return io;
};

function tryFn(socket: Socket, fn) {
    try {
        fn();
    } catch (e) {
        console.error(e.message);
        socket.emit('err', e.message);
    }
}