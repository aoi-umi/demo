import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '@/helpers';
import { myEnum } from '@/config';
import * as config from '@/config';
import { Auth } from '@/_system/auth';
import * as ValidSchema from '@/valid-schema/class-valid';

import { VideoMapper, VideoModel } from '@/models/mongo/video';

export let mgtQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let myData = req.myData;
        let user = myData.user;
        let data = paramsValid(req.query, ValidSchema.VideoQuery);

        let { rows, total } = await VideoMapper.query(data, {
            userId: user._id,
            audit: Auth.contains(user, config.auth.videoMgtAudit),
            resetOpt: {
                imgHost: myData.imgHost,
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
        let myData = req.myData;
        let user = myData.user;
        let data = paramsValid(req.query, ValidSchema.VideoDetailQuery);
        let rs = await VideoMapper.detailQuery({ _id: data._id }, {
            userId: user._id,
            audit: Auth.contains(user, config.auth.videoMgtAudit),
            resetOpt: {
                imgHost: myData.imgHost,
                videoHost: myData.videoHost,
                user,
            }
        });
        return rs;
    }, req, res);
};

export let mgtSave: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.VideoSave);
        let detail = await VideoMapper.mgtSave(data, { user });
        return {
            _id: detail._id
        };
    }, req, res);
};

export let mgtDel: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.VideoDel);
        await VideoMapper.updateStatus({
            cond: {
                idList: data.idList,
                includeUserId: Auth.contains(user, config.auth.videoMgtDel) ? null : user._id,
                status: { $ne: myEnum.videoStatus.已删除 },
            },
            toStatus: myEnum.videoStatus.已删除, user,
            logRemark: data.remark,
        });
    }, req, res);
};

export let mgtAudit: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.VideoMgtAudit);
        let rs = await VideoMapper.updateStatus({
            cond: {
                idList: data.idList,
                status: myEnum.videoStatus.待审核,
            },
            toStatus: data.status, user,
            logRemark: data.remark,
        });
        return rs;
    }, req, res);
};


export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let myData = req.myData;
        let user = myData.user;
        let data = paramsValid(req.query, ValidSchema.VideoQuery);

        let { rows, total } = await VideoMapper.query(data, {
            normal: true,
            resetOpt: {
                imgHost: myData.imgHost,
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
        let myData = req.myData;
        let user = myData.user;
        let data = paramsValid(req.query, ValidSchema.VideoDetailQuery);
        let rs = await VideoMapper.detailQuery({ _id: data._id }, {
            normal: true,
            resetOpt: {
                imgHost: myData.imgHost,
                videoHost: myData.videoHost,
                user: user.isLogin ? user : null,
            }
        });
        let detail = rs.detail;
        VideoModel.update({ _id: detail._id }, { readTimes: detail.readTimes + 1 }).exec();
        return rs;
    }, req, res);
};