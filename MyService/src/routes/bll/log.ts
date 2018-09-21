/**
 * Created by bang on 2017-9-5.
 */
import { Op, WhereOptions } from 'sequelize';
import * as autoBll from './_auto';
import { QueryOptions } from './_auto';
import * as common from '../_system/common';
import { Log, LogDataType, LogStatisticsOptions } from '../dal/models/dbModel/Log';
export let query = function (opt: QueryOptions<LogDataType> & {
    createDateStart?: string;
    createDateEnd?: string;
}) {
    return common.promise(async () => {
        let options = autoBll.createQueryOption(Log, opt, {
            //like option
            likeKeyList: ['url', 'application', 'method', 'methodName', 'req', 'res', 'ip', 'remark', 'requestIp']
        });
        let where = options.where as WhereOptions<Log>;
        if (opt.createDateStart || opt.createDateEnd) {
            where.createDate = {};
            if (opt.createDateStart)
                where.createDate[Op.gte] = opt.createDateStart;
            if (opt.createDateEnd)
                where.createDate[Op.lte] = opt.createDateEnd;
        }
        options.order = [['id', 'DESC']];
        let t = await Log.findAndCountAll(options);
        return {
            list: t.rows.map(r => r.dataValues),
            count: t.count
        }
    });
};

export let statistics = function (opt: LogStatisticsOptions) {
    return Log.customStatistics(opt);
}