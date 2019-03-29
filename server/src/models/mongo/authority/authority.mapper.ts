import { Types } from 'mongoose';
import { AuthorityModel } from ".";

export class AuthorityMapper {
    static async codeExists(code: string, _id?: any) {
        let cond: any = { code };
        if (_id) {
            cond._id = { $ne: Types.ObjectId(_id) };
        }
        let rs = await AuthorityModel.findOne(cond);
        return rs;
    }
}