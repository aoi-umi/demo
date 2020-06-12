import { Model, InstanceType } from "mongoose-ts-ua";
import { Types } from "mongoose";

import { myEnum } from "@/config";
import * as config from "@/config";
import { error } from "@/_system/common";
import * as ValidSchema from '@/valid-schema/class-valid';

import { ArticleModel } from "../article";
import { VideoModel } from "../video";
import { ContentBaseInstanceType, ContentResetOption, ContentMapper } from "../content";
import { FavouriteModel } from "./favourite";
import { BaseMapper } from "../_base";
import { UserMapper } from "../user";
import { VoteMapper } from "../vote";

export class FavouriteMapper {
    static async create(opt: {
        ownerId,
        userId,
        type,
    }) {
        let detail = await FavouriteModel.findOne({ ownerId: opt.ownerId, userId: opt.userId });
        if (!detail) {
            detail = new FavouriteModel({
                ownerId: opt.ownerId,
                userId: opt.userId,
                type: opt.type,
                favourite: false
            });
        }
        return detail;
    }

    static async findOwner(opt: {
        ownerId,
        type,
    }) {
        let owner: ContentBaseInstanceType;
        if (opt.type == myEnum.voteType.文章) {
            owner = await ArticleModel.findOne({
                _id: opt.ownerId,
                status: myEnum.articleStatus.审核通过
            });
        } else if (opt.type == myEnum.voteType.视频) {
            owner = await VideoModel.findOne({
                _id: opt.ownerId,
                status: myEnum.videoStatus.审核通过
            });
        }
        if (!owner)
            throw error('', config.error.NO_MATCH_DATA);
        return owner;
    }

    static lookupPipeline(opt: {
        userId: any;
        ownerIdKey?: string;
    }) {
        return [
            {
                $lookup: {
                    from: FavouriteModel.collection.collectionName,
                    let: { ownerId: '$' + (opt.ownerIdKey || '_id') },
                    pipeline: [{
                        $match: {
                            userId: Types.ObjectId(opt.userId),
                            $expr: { $eq: ['$$ownerId', '$ownerId'] }
                        }
                    }],
                    as: 'favouriteDetail'
                }
            },
            { $unwind: { path: '$favouriteDetail', preserveNullAndEmptyArrays: true } },
        ];
    }

    static async query(data: ValidSchema.FavouriteQuery, opt: ContentResetOption) {
        //
        let match2: any = {};
        let and = [];
        let anyKeyAnd = BaseMapper.multiKeyLike(data.anyKey, (anykey) => {
            return {
                $or: [
                    { title: anykey },
                    { content: anykey },
                    { profile: anykey },
                    { 'user.nickname': anykey },
                    { 'user.account': anykey },
                ]
            };
        });
        if (anyKeyAnd.length) {
            and.push({
                $and: anyKeyAnd
            });
        }
        if (and.length)
            match2.$and = and;
        let rs = await FavouriteModel.aggregatePaginate<{
            favouriteValue: boolean
        }>([
            {
                $match: {
                    userId: opt.user._id,
                }
            },
            {
                $lookup: {
                    from: ArticleModel.collection.collectionName,
                    let: { ownerId: '$ownerId' },
                    pipeline: [{
                        $match: {
                            $expr: { $eq: ['$$ownerId', '$_id'] }
                        }
                    }],
                    as: 'article'
                }
            },
            {
                $lookup: {
                    from: VideoModel.collection.collectionName,
                    let: { ownerId: '$ownerId' },
                    pipeline: [{
                        $match: {
                            $expr: { $eq: ['$$ownerId', '$_id'] }
                        }
                    }],
                    as: 'video'
                }
            },
            {
                $addFields: {
                    "article.contentType": myEnum.contentType.文章,
                    "video.contentType": myEnum.contentType.视频,
                }
            },
            {
                $project: {
                    favourAt: 1,
                    items: {
                        $concatArrays: ['$article', '$video']
                    }
                }
            },
            {
                $unwind: '$items'
            },
            {
                $replaceRoot: {
                    newRoot: { $mergeObjects: ['$items', { favourAt: '$favourAt' }] }
                }
            },
            ...UserMapper.lookupPipeline(),
            ...VoteMapper.lookupPipeline({
                userId: opt.user._id
            }),
            {
                $match: match2
            },
        ], {
            ...BaseMapper.getListOptions(data),
            orderBy: 'favourAt',
        });
        rs.rows = rs.rows.map(ele => {
            ContentMapper.resetDetail(ele, opt);
            ele.favouriteValue = true;
            return ele;
        });
        return rs;
    }
}