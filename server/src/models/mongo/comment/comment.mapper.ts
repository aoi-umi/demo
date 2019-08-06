import * as VaildSchema from '../../../vaild-schema/class-valid';
import { LoginUser } from '../../login-user';
import { CommentModel } from './comment';
import { BaseMapper } from '../_base';
import { ArticleMapper } from '../article';
import { myEnum } from '../../../config';
import { InstanceType } from 'mongoose-ts-ua';
import { UserModel } from '../user';

export class CommentMapper {
    static async create(data: VaildSchema.CommentSubmit, type, user: LoginUser) {
        let lastComment = await CommentModel.findOne({ ownerId: data.ownerId }).sort({ floor: -1 });
        let comment = new CommentModel({
            userId: user._id,
            ownerId: data.ownerId,
            comment: data.comment,
            quotId: data.quotId,
            type: type,
            floor: lastComment ? lastComment.floor + 1 : 1
        });
        return comment;
    }

    static async query(data: VaildSchema.CommentQuery) {
        let match: any = {
            ownerId: data.ownerId,
            type: data.type
        };

        return CommentModel.aggregatePaginate([
            {
                $match: match
            },
            {
                $lookup: {
                    from: UserModel.collection.collectionName,
                    let: { userId: '$userId' },
                    pipeline: [{
                        $match: {
                            $expr: { $eq: ['$$userId', '$_id'] }
                        }
                    }, {
                        $project: {
                            account: 1,
                            nickname: 1
                        }
                    }],
                    as: 'user'
                }
            },
            { $unwind: '$user' },
        ], {
                ...BaseMapper.getListOptions(data),
            });
    }

    static async findOwner(ownerId, type) {
        let owner: InstanceType<{ commentCount: number }>;
        if (type == myEnum.commentType.文章) {
            owner = await ArticleMapper.findOne({ _id: ownerId, status: myEnum.articleStatus.审核通过 });
        }
        return owner;
    }
}