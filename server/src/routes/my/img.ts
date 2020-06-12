
import { paramsValid } from '@/helpers';
import * as ValidSchema from '@/valid-schema/class-valid';
import { MyRequestHandler } from '@/middleware/my-request-handler';
import { FileMapper } from '@/models/mongo/file';


export let query: MyRequestHandler = async (opt) => {
    let data = paramsValid(opt.reqData, ValidSchema.ListBase);
    let user = opt.myData.user;
    let { rows, total } = await FileMapper.query(data, { user, host: opt.myData.imgHost });
    return {
        rows,
        total,
    };
};