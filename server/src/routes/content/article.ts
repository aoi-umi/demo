import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '@/helpers';
import { myEnum } from '@/config';
import * as config from '@/config';
import { Auth } from '@/_system/auth';
import * as ValidSchema from '@/valid-schema/class-valid';

import { ArticleModel, ArticleMapper } from '@/models/mongo/article';

/**
 * @api {get} /article/mgt/query mgt query
 * @apiGroup article
 * @apiParamClass (src/valid-schema/class-valid/article.ts) {AritcleQuery}
 */
export let mgtQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.query, ValidSchema.ArticleQuery);

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
        let data = paramsValid(req.query, ValidSchema.ArticleDetailQuery);
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
 * @apiParamClass (src/valid-schema/class-valid/article.ts) {AritcleSave}
 */
export let mgtSave: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.ArticleSave);
        let detail = await ArticleMapper.mgtSave(data, { user });
        return {
            _id: detail._id
        };
    }, req, res);
};

export let mgtDel: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.ArticleDel);
        await ArticleMapper.updateStatus({
            cond: {
                idList: data.idList,
                status: { $ne: myEnum.articleStatus.已删除 },
                includeUserId: Auth.contains(user, config.auth.articleMgtDel) ? null : user._id,
            },
            toStatus: myEnum.articleStatus.已删除, user,
            logRemark: data.remark,
        });
    }, req, res);
};

export let mgtAudit: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.ArticleMgtAudit);
        let rs = await ArticleMapper.updateStatus({
            cond: {
                idList: data.idList,
                status: myEnum.articleStatus.待审核,
            },
            toStatus: data.status, user,
            logRemark: data.remark,
        });
        return rs;
    }, req, res);
};


export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.query, ValidSchema.ArticleQuery);

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
        let data = paramsValid(req.query, ValidSchema.ArticleDetailQuery);
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