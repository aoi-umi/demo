import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp, getSchema
} from 'mongoose-ts-ua';
import { Types, SchemaTypes } from 'mongoose';
import * as Int32 from 'mongoose-int32';
import * as mathjs from 'mathjs';

import { myEnum } from '@/config';

import { Base } from '../_base';

export type PayInstanceType = InstanceType<Pay>;
export type PayModelType = ModelType<Pay, typeof Pay>;
export type PayDocType = DocType<PayInstanceType>;

@setSchema({
    schemaOptions: {
        toJSON: {
            virtuals: true
        }
    }
})
export class Pay extends Base {
    @prop({
        type: SchemaTypes.ObjectId,
        required: true
    })
    userId: Types.ObjectId;

    @prop({
        type: SchemaTypes.ObjectId,
    })
    assetLogId: Types.ObjectId;

    @prop({
        enum: myEnum.assetSourceType.getAllValue(),
        required: true,
    })
    type: number;

    @prop()
    get typeText() {
        return myEnum.assetSourceType.getKey(this.type);
    };

    @prop()
    title: string;

    @prop()
    content: string;

    @prop({
        enum: myEnum.payStatus.getAllValue(),
        default: myEnum.payStatus.未支付,
    })
    status: number;

    @prop()
    get statusText() {
        return myEnum.payStatus.getKey(this.status);
    };

    @prop({
        enum: myEnum.payStatus.getAllValue(),
        default: myEnum.payRefundStatus.未退款,
    })
    refundStatus: number;

    @prop()
    get refundStatusText() {
        return myEnum.payRefundStatus.getKey(this.refundStatus);
    };

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

    @prop()
    get canPay() {
        return [myEnum.payStatus.未支付].includes(this.status);
    }

    @prop()
    get canCancel() {
        return [myEnum.payStatus.未支付].includes(this.status);
    }
}

export const PayModel = getModelForClass<Pay, typeof Pay>(Pay);

