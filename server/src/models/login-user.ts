import { Type } from "class-transformer";

export class LoginUser {
    _id: string;
    nickname: string;
    account: string;
    authority: { [key: string]: boolean };
    key?: string;
    cacheDatetime?: string;
    // token?: string;
    loginData?: any;
    
    @Type()
    lastLoginAt?: Date;

    nameToString() {
        return this.nickname + '(' + this.account + ')';
    }
}