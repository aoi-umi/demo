import { RequestHandler } from 'express';

import { transaction } from '../_system/dbMongo';
import { error } from '../_system/common';
import { Auth } from '../_system/auth';
import * as config from '../config';
import { responseHandler, paramsValid } from '../helpers';
import * as VaildSchema from '../vaild-schema/class-valid';
import { CommentMapper, CommentModel } from '../models/mongo/comment';

export let submit: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, VaildSchema.CommentSubmit);
        let owner = await CommentMapper.findOwner({ ownerId: data.ownerId, type: data.type });
        let comment = await CommentMapper.create(data, data.type, user);
        comment.ip = req.realIp;
        await transaction(async (session) => {
            await comment.save({ session });
            await owner.update({ commentCount: owner.commentCount + 1 });
        });
        let ret = {
            ...comment.toJSON(),
            user: {
                account: user.account,
                nickname: user.nickname,
                avatar: user.avatar,
                avatarUrl: user.avatarUrl,
            }
        };
        return CommentMapper.resetDetail(ret, {
            user,
            imgHost: req.headers.host,
        });
    }, req, res);
};

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.query, VaildSchema.CommentQuery);
        let queryOpt = {
            resetOpt: {
                imgHost: req.headers.host,
                user: user.isLogin ? user : null
            }
        };
        let { total, rows } = await CommentMapper.query({
            ...data,
        }, queryOpt);

        //获取二级回复
        let { rows: replyList } = await CommentMapper.query({}, { ...queryOpt, replyTopId: rows.map(ele => ele._id) });
        return {
            rows,
            total,
            replyList
        };
    }, req, res);
};

export let del: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, VaildSchema.CommentDel);
        /**
         * 可删除
         * 1.本人
         * 2.有评论管理-删除权限的
         *  */
        let match = { _id: { $in: data.idList } };
        let delIdList = [];
        if (Auth.contains(user, config.auth.commentMgtDel)) {
            delIdList = data.idList;
        } else {
            //本人只能单条删除
            let id = data.idList[0];
            let detail = await CommentModel.findById(id);
            if (detail) {
                if (user.equalsId(detail.userId))
                    delIdList = [id];
                // else {
                //     let owner = await CommentMapper.findOwner({ ownerId: detail.ownerId, type: detail.type, mgt: true });
                //     if (owner && owner.userId.equals(user._id))
                //         delIdList = [id];
                // }
            }
        }
        if (!delIdList.length)
            throw error('', config.error.NO_MATCH_DATA);
        let rs = await CommentModel.updateMany(match, { status: config.myEnum.commentStatus.已删除 });
        if (!rs.n)
            throw error('', config.error.NO_MATCH_DATA);
    }, req, res);
};