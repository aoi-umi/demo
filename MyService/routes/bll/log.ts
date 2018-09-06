/**
 * Created by bang on 2017-9-5.
 */
import { Op, WhereOptions } from 'sequelize';
import * as autoBll from './_auto';
import * as common from '../_system/common';
import { LogModel } from '../dal/models/dbModel';
import { replaceSpCharLike } from '../_system/db';
export let query = function (opt) {
    return common.promise(async () => {
        let options = autoBll.createQueryOption(LogModel.Log, opt);
        let where = options.where as WhereOptions<LogModel.Log>;
        //like option
        ['url', 'application', 'method', 'methodName', 'req', 'res', 'ip', 'remark', 'requestIp'].forEach(key => {            
            if (where[key])
                where[key] = { [Op.like]: `%${replaceSpCharLike(options.where[key])}%` };
        });
        if (opt.createDateStart || opt.createDateEnd) {
            where.createDate = {};
            if (opt.createDateStart)
                where.createDate[Op.gte] = opt.createDateStart;
            if (opt.createDateEnd)
                where.createDate[Op.lte] = opt.createDateEnd;
        }
        options.order = [['id', 'DESC']];
        let t = await LogModel.Log.findAndCountAll(options);
        return {
            list: t.rows.map(r => r.dataValues),
            count: t.count
        }
    });
};

export let statistics = function (opt) {
    return LogModel.Log.customStatistics(opt);
}