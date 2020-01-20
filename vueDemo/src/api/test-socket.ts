import { myEnum, dev } from '@/config';
import * as helpers from '@/helpers';
import { LocalStore } from '@/store';
import { Socket } from './model';

//todo 连接后创建id关联
export class TestSocket extends Socket {
    constructor(uri: string, opts?: SocketIOClient.ConnectOpts) {
        opts = {
            ...opts,
        };
        if (!opts.query) {
            opts.query = {};
        }
        let id = LocalStore.getItem(dev.cacheKey.sessionId);
        if (!id) {
            id = helpers.randStr();
            LocalStore.setItem(dev.cacheKey.sessionId, id);
        }
        opts.query['sessionId'] = id;
        super(uri, opts);
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

    danmakuConnect(data) {
        this.socket.emit(myEnum.socket.弹幕池连接, data);

    }

    danmakuDisconnect(data) {
        this.socket.emit(myEnum.socket.弹幕池断开, data);
    }

    auth(data) {
        this.socket.emit(myEnum.socket.授权, data);
    }

    bindAuthRecv(fn: (data) => void) {
        this.socket.on(myEnum.socket.授权接收, (msg) => {
            fn(msg);
        });
    }
}