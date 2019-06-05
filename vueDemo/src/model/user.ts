export type LoginUserType = UserInfo & LoginUser;
export class LoginUser {
    static create(data: UserInfo) {
        let user = new LoginUser();
        let setKey: (keyof UserInfo)[] = ['_id', 'account', 'key', 'nickname', 'authority'];
        setKey.forEach(key => {
            user[key] = data[key];
        });
        return user as LoginUserType;
    }
}