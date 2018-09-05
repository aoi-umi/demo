
import * as logDal from '../../log';
import _AutoLog from "../_auto/_auto.log.model";
export class Log extends _AutoLog {
    static async customStatistics(params, conn?) {
        let t = await logDal.statistics(params, conn);
        return t.data;
    }
};