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

    hasAuth(this: LoginUserType, auth: string) {
        return this.authority && this.authority[auth];
    }
}