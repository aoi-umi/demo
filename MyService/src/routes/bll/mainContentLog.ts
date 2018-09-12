
import * as common from '../_system/common';
import * as autoBll from './_auto';
import { updateMainContentLog } from './mainContent';

export let query: InterfaceCustomFunction = function (opt, exOpt) {
    return common.promise(async () => {
        if (!opt.mainContentId)
            throw common.error('mainContentId不能为空');
        autoBll.fixPage(opt);

        opt.orderBy = [
            ['id', 'desc']
        ];
        //todo 校验权限
        let result = await autoBll.modules.mainContentLog.query(opt);
        result.list.forEach(ele => {
            updateMainContentLog(ele);
        });
        return result;
    });
}