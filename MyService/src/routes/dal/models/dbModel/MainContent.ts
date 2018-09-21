
import * as mainContentDal from '../../mainContent';
import _AutoMainContent, { _AutoMainContentDataType } from "../_auto/_auto.mainContent.model";
export type MainContentDataType = _AutoMainContentDataType;
export type MainContentCustomQueryOptions = mainContentDal._QueryOptions;
export type MainContentCustomDetailQueryOptions = mainContentDal._DetailQueryOptions;
export class MainContent extends _AutoMainContent {
    static async customQuery(params: MainContentCustomQueryOptions, conn?) {
        let t = await mainContentDal.query(params, conn);
        return t.data;
    }
    static async customDetailQuery(params: MainContentCustomDetailQueryOptions, conn?) {
        let t = await mainContentDal.detailQuery(params, conn);
        return t.data;
    }
};