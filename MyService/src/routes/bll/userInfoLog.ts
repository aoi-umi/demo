
import * as common from '../_system/common';
import * as autoBll from './_auto';
import { isHadAuthority } from '../_system/auth';

export let query: InterfaceCustomFunction = function (opt, exOpt) {
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
            return !(ele.type != 0 && !isHadAuthority(exOpt.user, 'admin'))
        });
        return result;
    });
}