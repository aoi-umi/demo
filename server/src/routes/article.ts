import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '@/helpers';
import { myEnum } from '@/config';
import * as config from '@/config';
import { error } from '@/_system/common';
import { Auth } from '@/_system/auth';
import { transaction } from '@/_system/dbMongo';
import * as VaildSchema from '@/vaild-schema/class-valid';

import { ArticleModel, ArticleInstanceType, ArticleMapper, ArticleDocType } from '@/models/mongo/article';

/**
 * @api {get} /article/mgt/query mgt query
 * @apiGroup article
 * @apiParamClass (src/vaild-schema/class-valid/article.ts) {AritcleQuery}
 */
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

/**
 * @api {post} /article/mgt/save mgt save
 * @apiGroup article
 * @apiParamClass (src/vaild-schema/class-valid/article.ts) {AritcleSave}
 */
export let mgtSave: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, VaildSchema.AritcleSave);
        let detail = await ArticleMapper.mgtSave(data, { user });
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