
import * as RoleDal from '../../role';
import _AutoRole, { _AutoRoleDataType } from "../_auto/_auto.role.model";
export type RoleDataType = _AutoRoleDataType;
export type RoleCustomQueryOptions = RoleDal._QueryOptions;
export type RoleCustomDetailQueryOptions = RoleDal._DetailQueryOptions;
export class Role extends _AutoRole {
    static async customQuery(params: RoleCustomQueryOptions, conn?) {
        let t = await RoleDal.query(params, conn);
        return t.data;
    }
    static async customDetailQuery(params: RoleCustomDetailQueryOptions, conn?) {
        let t = await RoleDal.detailQuery(params, conn);
        return t.data;
    }
};