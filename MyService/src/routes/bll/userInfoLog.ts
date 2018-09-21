
import * as common from '../_system/common';
import * as autoBll from './_auto';
import { QueryOptions } from './_auto';
import { isHadAuthority, authConfig } from '../_system/auth';
import { InterfaceExOpt } from '../module/_interface';
import { UserInfoLogModel } from '../dal/models/dbModel';
type UserInfoLogDataType = UserInfoLogModel.UserInfoLogDataType;

export let query = function (opt: QueryOptions<UserInfoLogDataType>, exOpt: InterfaceExOpt) {
    return common.promise(async () => {
        if (!opt.userInfoId)
            throw common.error('userInfoId不能为空');
        autoBll.fixPage(opt);

        opt.orderBy = [
            ['id', 'desc']
        ];
        //todo 校验权限
        let result = await autoBll.modules.userInfoLog.query(opt);
        result.list = result.list.filter(ele => {
            return !(ele.type != 0 && !isHadAuthority(exOpt.user, authConfig.admin))
        });
        return result;
    });
}