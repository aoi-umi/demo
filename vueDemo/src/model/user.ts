import * as helpers from '@/helpers';

export type LoginUserType = UserInfo & LoginUser;
export class LoginUser {
    isLogin = false;
    static create(data: UserInfo) {
        let user = new LoginUser();
        if (data) {
            for (let key in data) {
                user[key] = data[key];
            }
            user.isLogin = true;
        } else {

        }
        return user as LoginUserType;
    }

    hasAuth(this: LoginUserType, auth: string | string[]) {
        if (auth) {
            let authList = auth instanceof Array ? auth : [auth];
            for (let ele of authList) {
                if (!this.authority || !this.authority[ele])
                    return false;
            }
        }
        return true;
    }

    existsAuth(this: LoginUserType, auth: string | string[]) {
        let authList = auth instanceof Array ? auth : [auth];
        for (let ele of authList) {
            if (this.authority && this.authority[ele])
                return true;
        }
        return false;
    }

    equalsId(this: LoginUserType, id: string) {
        return this._id && this._id === id;
    }

    static createToken(account, pwd, data) {
        let token = account + helpers.md5(pwd) + JSON.stringify(data);
        token = helpers.md5(token);
        return token;
    }
}