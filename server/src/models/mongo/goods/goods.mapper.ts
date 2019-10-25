
import { Types } from 'mongoose';

import * as config from '@/config';
import { myEnum } from '@/config';
import * as ValidSchema from '@/valid-schema/class-valid';
import { error, escapeRegExp } from '@/_system/common';
import { LoginUser } from '@/models/login-user';

import { GoodsSpuModel, GoodsSpuInstanceType } from './goods-spu';
import { GoodsSpecGroupModel, GoodsSpecGroupInstanceType } from './goods-spec-group';
import { GoodsSkuModel, GoodsSkuInstanceType } from './goods-sku';
import { transaction } from '@/_system/dbMongo';

type DetailType = {
    spu: GoodsSpuInstanceType,
    specGroup: GoodsSpecGroupInstanceType[],
    sku: GoodsSkuInstanceType[]
};
export class GoodsMapper {
    static async save(data: ValidSchema.GoodsSave, opt: {
        user: LoginUser
    }) {
        let { user } = opt;
        let detail: DetailType;
        let delGroupId = [], delSkuId = [];
        if (data.spu._id) {
            detail = await GoodsMapper.detailQuery({ _id: data.spu._id });
            delGroupId = detail.specGroup.map(ele => ele._id);
            delSkuId = detail.sku.map(ele => ele._id);
        } else {
            let spu = new GoodsSpuModel({ _id: data.spu._id });
            let specGroup = data.specGroup.map(ele => new GoodsSpecGroupModel(ele));
            let sku = data.sku.map(ele => new GoodsSkuModel(ele));
            detail = {
                spu,
                specGroup,
                sku,
            };
        }

        ['name', 'typeIds', 'profile', 'imgs', 'status', 'putOnAt', 'expireAt'].forEach(key => {
            detail.spu[key] = data.spu[key];
        });
        detail.spu.userId = user._id;
        if (!detail.spu.putOnAt)
            detail.spu.putOnAt = new Date();

        detail.specGroup.forEach(ele => {
            ele._id = Types.ObjectId();
            ele.spuId = detail.spu._id;
        });

        detail.sku.forEach(ele => {
            ele._id = Types.ObjectId();
            ele.spuId = detail.spu._id;
            ele.name = ele.spec.join('');
        });
        await transaction(async (session) => {
            await detail.spu.save({ session });
            await GoodsSpecGroupModel.insertMany(detail.specGroup.map(ele => ele.toObject()), { session });
            await GoodsSkuModel.insertMany(detail.sku.map(ele => ele.toObject()), { session });
            if (delGroupId.length)
                await GoodsSpecGroupModel.deleteMany({ _id: delGroupId }, { session });
            if (delSkuId.length)
                await GoodsSkuModel.deleteMany({ _id: delSkuId }, { session });
        });
        return detail;
    }

    static async detailQuery(data) {
        let _id = Types.ObjectId(data._id);
        let spu = await GoodsSpuModel.findOne({ _id });
        if (!spu)
            throw error('', config.error.DB_NO_DATA);
        let specGroup = await GoodsSpecGroupModel.find({ spuId: spu._id });
        let sku = await GoodsSkuModel.find({ spuId: spu._id });
        return {
            spu,
            specGroup,
            sku
        } as DetailType;
    }
}