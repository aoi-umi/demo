
import { Types } from 'mongoose';

import * as config from '@/config';
import { myEnum } from '@/config';
import * as ValidSchema from '@/valid-schema/class-valid';
import { error, escapeRegExp } from '@/_system/common';
import { transaction } from '@/_system/dbMongo';
import { LoginUser } from '@/models/login-user';

import { GoodsSpuModel, GoodsSpuInstanceType } from './goods-spu';
import { GoodsSpecGroupModel, GoodsSpecGroupInstanceType } from './goods-spec-group';
import { GoodsSkuModel, GoodsSkuInstanceType } from './goods-sku';
import { BaseMapper } from '../_base';
import { FileMapper } from '../file';

type DetailType = {
    spu: GoodsSpuInstanceType,
    specGroup: GoodsSpecGroupInstanceType[],
    sku: GoodsSkuInstanceType[]
};

type SpuResetType = {
    imgHost?: string;
    user: LoginUser
};
export class GoodsMapper {
    static async mgtSave(data: ValidSchema.GoodsMgtSave, opt: {
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

    static async query(data: ValidSchema.GoodsMgtQuery, opt: {
        audit?: boolean;
        user: LoginUser,
        resetOpt: SpuResetType,
    }) {
        let { user } = opt;
        let match: any = {};
        if (data.status)
            match.status = { $in: data.status.split(',') };
        if (data.name)
            match.name = new RegExp(escapeRegExp(data.name), 'i');
        if (!opt.audit) {
            match.userId = user._id;
        }
        let rs = await GoodsSpuModel.findAndCountAll({
            conditions: match,
            ...BaseMapper.getListOptions(data)
        });
        return {
            rows: rs.rows.map(ele => {
                let obj = ele.toJSON();
                this.resetSpu(obj, opt.resetOpt);
                return obj;
            }),
            total: rs.total
        };
    }

    static resetSpu(detail, opt: SpuResetType) {
        if (opt.imgHost) {
            detail.imgUrls = detail.imgs.map(ele => {
                return FileMapper.getImgUrl(ele, opt.imgHost);
            });
        }
        detail.canUpdate = detail.canUpdate && opt.user.equalsId(detail.userId);
        detail.canDel = detail.canDel && opt.user.equalsId(detail.userId);
    }

    static async updateStatus(opt: {
        cond: {
            idList: Types.ObjectId[],
            status?: any;
            includeUserId?: Types.ObjectId | string;
        };
        toStatus: number;
        user: LoginUser
    }) {
        let { user, toStatus } = opt;
        let { idList, includeUserId, status } = opt.cond;
        let cond: any = { _id: { $in: idList } };
        if (status !== undefined)
            cond.status = status;
        if (includeUserId)
            cond.userId = Types.ObjectId(includeUserId as any);
        let list = await GoodsSpuModel.find(cond);
        if (!list.length)
            throw error('', config.error.NO_MATCH_DATA);
        let bulk = [];
        for (let detail of list) {
            if (detail.status === toStatus)
                continue;
            let update: any = { status: toStatus };
            bulk.push({
                updateOne: {
                    filter: { ...cond, _id: detail._id },
                    update: {
                        $set: update
                    }
                }
            });
        }

        if (!bulk.length)
            return;
        await GoodsSpuModel.bulkWrite(bulk);
    }
}