/**
 * Created by bang on 2017-9-7.
 */
import * as mainContentBll from '../bll/mainContent';
import { modules } from '../bll/_auto';
import { myEnum } from '../_main';
const { mainContentStatusEnum } = myEnum;

export let detailQuery = function (opt, viewOpt) {
    opt.noLog = true;
    return mainContentBll.detailQuery(opt, viewOpt).then(function (t) {
        viewOpt.mainContentDetail = t;
        if (t.mainContent.status == mainContentStatusEnum.通过)
            modules.mainContent.save({ id: t.mainContent.id, click: t.mainContent.click + 1 });
    });
}