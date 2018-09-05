
import * as mainContentDal from '../../mainContent';
import _AutoMainContent from "../_auto/_auto.mainContent.model";
export class MainContent extends _AutoMainContent {
    static async customQuery(params, conn?) {
        let t = await mainContentDal.query(params, conn);
        return t.data;
    }
    static async customDetailQuery(params, conn?) {
        let t = await mainContentDal.detailQuery(params, conn);
        return t.data;
    }
};