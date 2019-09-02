import { Type, Transform } from "class-transformer";
import { Types } from 'mongoose';

export class LoginUser {
    isLogin: boolean;

    @Transform(value => Types.ObjectId(value))
    _id: Types.ObjectId;
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

    equalsId(id) {
        return this._id && this._id.equals(id);
    }
}