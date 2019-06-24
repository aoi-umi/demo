import { Socket } from './model';
import { myEnum } from '@/config';

export class TestSocket extends Socket {
    constructor(uri: string, opts?: SocketIOClient.ConnectOpts) {
        super(uri, opts);
    }

    danmakuSend(data) {
        this.socket.emit(myEnum.socket.弹幕发送, data);
    }

    bindDanmakuRecv(fn: (data) => void) {
        this.socket.on(myEnum.socket.弹幕接收, (msg) => {
            fn(msg);
        });
    }
}