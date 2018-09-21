import * as autoBll from './_auto';
import { QueryOptions } from './_auto';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
import { Authority, AuthorityDataType, AuthorityCustomQueryptions } from '../dal/models/dbModel/Authority';

export let save = function (opt: AuthorityDataType & { statusUpdateOnly?: boolean }) {
    return common.promise(async function () {
        if (opt.statusUpdateOnly) {
            if (!opt.id || opt.id == 0)
                throw common.error('id不能为空');
            opt = {
                id: opt.id,
                status: opt.status
            };
        } else {
            let t = await isExist(opt);
            if (t)
                throw common.error(`code[${opt.code}]已存在`);
        }
        return autoBll.modules.authority.save(opt);
    });
};

export let isExist = function (opt: AuthorityDataType) {
    var code = opt.code;
    return common.promise(async function () {
        if (!code)
            throw common.error('code不能为空');
        let t = await autoBll.modules.authority.query({ code: code });
        var result = false;
        if (t.list.length > 1)
            throw common.error('数据库中存在重复权限', errorConfig.DB_DATA_ERROR);
        if (t.list.length && t.list[0].id != opt.id) {
            result = true;
        }
        return result;
    });
};

export let query = function (opt: AuthorityCustomQueryptions) {
    return common.promise(async function () {
        if (opt.id || opt.anyKey) {
            delete opt.code;
            delete opt.name;
            if (opt.id) {
                delete opt.anyKey;
            }
        }
        opt.orderBy = 'code';
        return Authority.customQuery(opt);
    });
};

