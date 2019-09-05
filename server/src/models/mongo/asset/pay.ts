import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp, getSchema
} from 'mongoose-ts-ua';
import { Types, SchemaTypes } from 'mongoose';
import * as Int32 from 'mongoose-int32';
import * as mathjs from 'mathjs';
import { Base } from '../_base';
import { myEnum } from '../../../config';

export type PayInstanceType = InstanceType<Pay>;
export type PayModelType = ModelType<Pay, typeof Pay>;
export type PayDocType = DocType<PayInstanceType>;

@setSchema()
export class Pay extends Base {
    @prop({
        type: SchemaTypes.ObjectId,
        required: true
    })
    userId: Types.ObjectId;

    @prop({
        enum: myEnum.assetSourceType.getAllValue(),
        required: true,
    })
    type: number;

    @prop({
        index: { unique: true },
    })
    outPayOrderId: string;

    @prop({
        enum: myEnum.payStatus.getAllValue(),
        default: myEnum.payStatus.未支付,
    })
    status: number;

    @prop({
        enum: myEnum.payStatus.getAllValue(),
        default: myEnum.payRefundStatus.未退款,
    })
    refundStatus: number;

    @prop()
    get money() {
        return mathjs.round(this.moneyCent / 100, 2) as number;
    }

    set money(val) {
        this.moneyCent = Math.round(val * 100);
    }

    @prop({
        type: Int32,
        required: true
    })
    moneyCent: number;

    @prop({
        type: Int32,
        validate: (val) => {
            return val > 0;
        }
    })
    refundMoneyCent: number;
}

export const PayModel = getModelForClass<Pay, typeof Pay>(Pay);

