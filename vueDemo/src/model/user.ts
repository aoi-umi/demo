export type LoginUserType = UserInfo & LoginUser;
export class LoginUser {
    isLogin = false;
    static create(data: UserInfo) {
        let user = new LoginUser();
        if (data) {
            let setKey: (keyof UserInfo)[] = ['_id', 'account', 'key', 'nickname', 'authority'];
            setKey.forEach(key => {
                user[key] = data[key];
            });
            user.isLogin = true;
        } else {

        }
        return user as LoginUserType;
    }

    hasAuth(this: LoginUserType, auth: string | string[]) {
        let authList = auth instanceof Array ? auth : [auth];
        let rs = false;
        for (let ele of authList) {
            if (!this.authority || !this.authority[ele])
                return false;
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
}