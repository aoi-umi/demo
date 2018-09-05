
import * as RoleDal from '../../role';
import _AutoRole from "../_auto/_auto.role.model";
export class Role extends _AutoRole {
    static async customQuery(params, conn?) {
        let t = await RoleDal.query(params, conn);
        return t.data;
    }
    static async customDetailQuery(params, conn?) {
        let t = await RoleDal.detailQuery(params, conn);
        return t.data;
    }
};