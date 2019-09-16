import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '@/helpers';
import { myEnum } from '@/config';
import * as config from '@/config';
import { error } from '@/_system/common';
import { Auth } from '@/_system/auth';
import { transaction } from '@/_system/dbMongo';
import * as VaildSchema from '@/vaild-schema/class-valid';

import { ArticleModel, ArticleInstanceType, ArticleMapper, ArticleLogMapper, ArticleDocType } from '@/models/mongo/article';

export let mgtQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.query, VaildSchema.AritcleQuery);

        let { rows, total } = await ArticleMapper.query(data, {
            userId: user._id,
            audit: Auth.contains(user, config.auth.articleMgtAudit),
            resetOpt: {
                imgHost: req.myData.imgHost,
                user,
            }
        });
        return {
            rows,
            total
        };
    }, req, res);
};

export let mgtDetailQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.query, VaildSchema.AritcleDetailQuery);;
        let rs = await ArticleMapper.detailQuery({ _id: data._id }, {
            userId: user._id,
            audit: Auth.contains(user, config.auth.articleMgtAudit),
            resetOpt: {
                imgHost: req.myData.imgHost,
                user,
            }
        });
        return rs;
    }, req, res);
};

export let mgtSave: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, VaildSchema.AritcleSave);
        let detail: ArticleInstanceType;
        let status = data.submit ? myEnum.articleStatus.待审核 : myEnum.articleStatus.草稿;
        if (!data._id) {
            delete data._id;
            detail = new ArticleModel({
                ...data,
                status,
                userId: user._id,
            });
            let log = ArticleLogMapper.create(detail, user, { srcStatus: myEnum.articleStatus.草稿, destStatus: status, remark: detail.remark });
            await transaction(async (session) => {
                await detail.save({ session });
                await log.save({ session });
            });
        } else {
            detail = await ArticleMapper.findOne({ _id: data._id });
            if (!user.equalsId(detail.userId))
                throw error('', config.error.NO_PERMISSIONS);
            if (!detail.canUpdate) {
                throw error('当前状态无法修改');
            }
            let update: any = {
                status,
            };
            let updateKey: (keyof ArticleDocType)[] = [
                'cover', 'title', 'profile', 'content', 'remark',
                'setPublish', 'setPublishAt'
            ];
            updateKey.forEach(key => {
                update[key] = data[key];
            });
            let logRemark = update.remark == detail.remark ? null : update.remark;
            let log = ArticleLogMapper.create(detail, user, { srcStatus: detail.status, destStatus: status, remark: logRemark });
            await transaction(async (session) => {
                await detail.update(update);
                await log.save({ session });
            });
        }
        return {
            _id: detail._id
        };
    }, req, res);
};

export let mgtDel: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, VaildSchema.ArticleDel);
        await ArticleMapper.updateStatus(data.idList, myEnum.articleStatus.已删除, user, {
            includeUserId: Auth.contains(user, config.auth.articleMgtDel) ? null : user._id,
            status: { $ne: myEnum.articleStatus.已删除 },
            logRemark: data.remark,
        });
    }, req, res);
};

export let mgtAudit: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, VaildSchema.ArticleMgtAudit);
        let rs = await ArticleMapper.updateStatus(data.idList, data.status, user, {
            status: myEnum.articleStatus.待审核,
            logRemark: data.remark,
        });
        return rs;
    }, req, res);
};


export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.query, VaildSchema.AritcleQuery);

        data.orderBy = 'publishAt';
        let { rows, total } = await ArticleMapper.query(data, {
            normal: true,
            resetOpt: {
                imgHost: req.myData.imgHost,
                user: user.isLogin ? user : null,
            }
        });
        return {
            rows,
            total
        };
    }, req, res);
};

export let detailQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.query, VaildSchema.AritcleDetailQuery);
        let rs = await ArticleMapper.detailQuery({ _id: data._id }, {
            normal: true,
            resetOpt: {
                imgHost: req.myData.imgHost,
                user: user.isLogin ? user : null,
            }
        });
        let detail = rs.detail;
        ArticleModel.update({ _id: detail._id }, { readTimes: detail.readTimes + 1 }).exec();
        return rs;
    }, req, res);
};