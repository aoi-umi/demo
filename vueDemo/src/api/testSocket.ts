import { myEnum, dev } from '@/config';
import { Socket } from './model';

export class TestSocket extends Socket {
    constructor(uri: string, opts?: SocketIOClient.ConnectOpts) {
        super(uri, opts);
        this.socket.on('connect', () => {
            let token = localStorage.getItem(dev.cacheKey.testUser);
            if (token)
                this.login({ [dev.cacheKey.testUser]: token });
        });
    }

    danmakuSend(data) {
        this.socket.emit(myEnum.socket.弹幕发送, data);
    }

    bindDanmakuRecv(fn: (data) => void) {
        this.socket.on(myEnum.socket.弹幕接收, (msg) => {
            fn(msg);
        });
    }

    login(data) {
        this.socket.emit(myEnum.socket.登录, data);
    }

    logout(data) {
        this.socket.emit(myEnum.socket.登出, data);
    }

    bindChatRecv(fn: (data) => void) {
        this.socket.on(myEnum.socket.私信接收, (msg) => {
            fn(msg);
        });
    }
}