/**
 * Created by bang on 2017-9-5.
 */
import { Op, WhereOptions } from 'sequelize';
import * as autoBll from './_auto';
import * as common from '../_system/common';
import { LogModel } from '../dal/models/dbModel';
export let query = function (opt) {
    return common.promise(async () => {
        let options = autoBll.createQueryOption(LogModel.Log, opt, {
            //like option
            likeKeyList: ['url', 'application', 'method', 'methodName', 'req', 'res', 'ip', 'remark', 'requestIp']
        });
        let where = options.where as WhereOptions<LogModel.Log>;        
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