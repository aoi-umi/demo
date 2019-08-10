import { Type } from "class-transformer";

export class LoginUser {
    _id: string;
    nickname: string;
    account: string;
    avatar?: string;
    avatarUrl?: string;

    authority: { [key: string]: boolean };
    key?: string;
    loginData?: any;

    @Type()
    cacheAt?: Date;

    nameToString() {
        return this.nickname + '(' + this.account + ')';
    }
}