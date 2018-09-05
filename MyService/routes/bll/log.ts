/**
 * Created by bang on 2017-9-5.
 */
import { Op } from 'sequelize';
import * as autoBll from './_auto';
import * as common from '../_system/common';
import { Log } from '../dal/models/dbModel';
import { replaceSpCharLike } from '../_system/db';

export let query = function (opt) {
    return common.promise(async () => {
        let options = autoBll.createQueryOption(Log, opt);
        //like option
        ['url', 'application', 'method', 'methodName', 'req', 'res', 'ip', 'remark', 'requestIp'].forEach(key => {            
            if (options.where[key])
                options.where[key] = { [Op.like]: `%${replaceSpCharLike(options.where[key])}%` };
        });

        if (opt.createDateStart || opt.createDateEnd) {
            options.where.createDate = {};
            if (opt.createDateStart)
                options.where.createDate[Op.gte] = opt.createDateStart;
            if (opt.createDateEnd)
                options.where.createDate[Op.lte] = opt.createDateEnd;
        }
        let t = await Log.findAndCountAll(options);
        return {
            list: t.rows.map(r => r.dataValues),
            count: t.count
        }
    });
};

export let statistics = function (opt) {
    return Log.customStatistics(opt);
}