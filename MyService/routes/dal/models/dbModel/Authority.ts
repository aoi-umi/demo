
import * as authorityDal from '../../authority';
import _AutoAuthority, { _AutoAuthorityDataType } from "../_auto/_auto.authority.model";
export type AuthorityDataType = _AutoAuthorityDataType;
export class Authority extends _AutoAuthority {
    static async customQuery(params, conn?) {
        let t = await authorityDal.query(params, conn);
        return t.data;
    }
};