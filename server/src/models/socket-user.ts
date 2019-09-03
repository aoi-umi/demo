import { UserAuthMid } from "../middleware";
import { myEnum } from "../config";
import * as config from "../config";

export class SocketUser {
    socket: { [userId: string]: Socket[] } = {};

    async addUser(data, socket: Socket) {
        let user = await UserAuthMid.getUser(data[config.dev.cacheKey.user]);
        if (user.isLogin) {
            let key = user._id.toString();
            socket.myData.userId = key;
            if (!this.socket[key])
                this.socket[key] = [];
            let list = this.socket[key];
            if (!list.includes(socket))
                list.push(socket);
        }
    }

    delUserBySocket(socket: Socket) {
        let key = socket.myData.userId;
        if (key && this.socket[key]) {
            this.socket[key].splice(this.socket[key].indexOf(socket), 1);
        }

    }

    sendChat(data) {
        let userId = data.destUserId;
        if (this.socket[userId]) {
            for (let socket of this.socket[userId]) {
                socket.emit(myEnum.socket.私信接收, data);
            }
        }
    }
}