import { Types } from 'mongoose';
import { RoleModel } from ".";

export class RoleMapper {
    static async codeExists(code: string, _id?: any) {
        let cond: any = { code };
        if (_id) {
            cond._id = { $ne: Types.ObjectId(_id) };
        }
        let rs = await RoleModel.findOne(cond);
        return rs;
    }

    static async query(data: RoleQueryArgs) {
        let query: any = {};
        let noTotal = false;
        if (data._id) {
            query._id = Types.ObjectId(data._id);
            noTotal = true;
        }
        if (data.anyKey) {
            let anykey = new RegExp(data.anyKey, 'i');
            query.$or = [
                { code: anykey },
                { name: anykey },
            ];
        }

        if (data.name)
            query.name = new RegExp(data.name, 'i');
        if (data.code)
            query.code = new RegExp(data.code, 'i');
        let status = parseInt(data.status);
        if (!isNaN(status))
            query.status = status;

        let pipeline: any[] = [{
            $match: query,
        }];
        let rs = await RoleModel.aggregatePaginate(pipeline, {
            page: data.page,
            rows: data.rows,
            noTotal,
        });
        return rs;
    }
}

export type RoleQueryArgs = {
    _id?: string;
    code?: string;
    name?: string;
    status?: string;
    anyKey?: string;
} & ApiListQueryArgs;