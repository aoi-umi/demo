import { UserModel } from ".";

export class UserMapper {
    static async accountExists(account: string) {
        let rs = await UserModel.findOne({ account });
        return rs;
    }

    static async query(data: UserQueryArgs) { }
}

export type UserQueryArgs = {
    _id?: string;
    account?: string;
    nickname?: string;
    authority?: string;
    role?: string;
    anyKey?: string;
} & ApiListQueryArgs;