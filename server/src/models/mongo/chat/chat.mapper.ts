import { Model, InstanceType } from "mongoose-ts-ua";
import { Types } from "mongoose";
import { myEnum } from "../../../config";
import * as VaildSchema from '../../../vaild-schema/class-valid';
import { UserMapper, UserResetOption } from "../user";
import { ChatModel } from "./chat";

export class ChatMapper {
    static async query(data: VaildSchema.ChatQuery, opt: { userId: any } & UserResetOption) {
        let userId = Types.ObjectId(opt.userId);
        let match: any = {
            $or: [{
                userId,
                destUserId: data.destUserId,
            }, {
                destUserId: userId,
                userId: data.destUserId,
            }]
        };
        if (data.lastId)
            match._id = { $lt: data.lastId };
        let rs = await ChatModel.aggregatePaginate([
            {
                $match: match
            },
        ], {
                rows: data.rows,
            });

        rs.rows = rs.rows.reverse();
        return rs;
    }
}