
import * as logDal from '../../log';
import _AutoLog, { _AutoLogDataType } from "../_auto/_auto.log.model";
export type LogDataType = _AutoLogDataType;
export type LogStatisticsOptions = logDal._StatisticsOptions;

export class Log extends _AutoLog {
    static async customStatistics(params: LogStatisticsOptions, conn?) {
        let t = await logDal.statistics(params, conn);
        return t.data;
    }
};