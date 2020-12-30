import { LoginUser } from '@/models/login-user';
import { PrintInstanceType, PrintModel, } from './print';
export class PrintMapper {
    static async query() {
        let rs = await PrintModel.findAndCountAll({
            projection: { data: 0 },
        });
        return rs;
    }

    static async save(data: any, opt: {
        user: LoginUser
    }) {
        let detail: PrintInstanceType;
        if (data._id) {
            detail = await PrintModel.findOne({ _id: data._id });
        } else {
            detail = new PrintModel(data);
        }
        await detail.save();
        return detail;
    }
}