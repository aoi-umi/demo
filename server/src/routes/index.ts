import * as express from 'express';
let router = express.Router();
export default router;
import { UserAuthMid, FileMid } from '@/middleware';
import { auth } from '@/config';

import user from './user';
router.use(user);

import content from './content';
router.use(content);

//#region bookmark 
import * as bookmark from './bookmark';
router.get('/bookmark/query', UserAuthMid.normal(), bookmark.query);
router.post('/bookmark/save', UserAuthMid.normal(), bookmark.save);
router.post('/bookmark/del', UserAuthMid.normal(), bookmark.del);
//#endregion

//#region pay 
import * as pay from './pay';
// router.post('/pay/create', UserAuthMid.normal([auth.login]), pay.create);
router.post('/pay/submit', UserAuthMid.normal([auth.login]), pay.submit);
router.post('/pay/cancel', UserAuthMid.normal([auth.login]), pay.cancel);
router.get('/pay/query', UserAuthMid.normal([auth.login]), pay.query);
router.post('/pay/refundApply', UserAuthMid.normal([auth.login]), pay.refundApply);
router.post('/pay/refund', UserAuthMid.normal([auth.payMgtOperate]), pay.refund);
//#endregion

//#region notify 
import * as notify from './notify';
router.post('/alipay/notify', notify.alipayNotify);
router.post('/wxpay/notify', notify.wxpayNotify);
//#endregion

//#region asset 
import * as asset from './asset';
router.get('/asset/notifyQuery', UserAuthMid.normal([auth.payMgtQuery]), asset.notifyQuery);
router.post('/asset/notifyRetry', UserAuthMid.normal([auth.payMgtOperate]), asset.notifyRetry);
router.get('/asset/logQuery', UserAuthMid.normal([auth.payMgtQuery]), asset.logQuery);
//#endregion

//#region file 
import * as file from './file';
router.post('/img/upload', UserAuthMid.normal([auth.login]), FileMid.single, file.imgUpload);
router.get('/img', UserAuthMid.normal(), file.imgGet);

router.post('/video/upload', UserAuthMid.normal([auth.login]), FileMid.single, file.videoUpload);
router.get('/video', file.vedioGet);
//#endregion

//#region goods 
import * as goods from './goods';
router.post('/goods/mgt/save', UserAuthMid.normal([auth.login]), goods.mgtSave);
router.get('/goods/mgt/detailQuery', UserAuthMid.normal([auth.login]), goods.mgtDetailQuery);
router.get('/goods/mgt/query', UserAuthMid.normal([auth.login]), goods.mgtQuery);
router.post('/goods/mgt/del', UserAuthMid.normal([auth.login]), goods.mgtDel);

router.get('/goods/detailQuery', UserAuthMid.normal(), goods.detailQuery);
router.get('/goods/query', UserAuthMid.normal(), goods.query);
router.post('/goods/buy', UserAuthMid.normal(), goods.buy);
//#endregion

//#region setting 
import * as setting from './setting';
router.get('/setting/mgt/detailQuery', UserAuthMid.normal([auth.settingQuery]), setting.detailQuery);
router.post('/setting/mgt/save', UserAuthMid.normal([auth.settingSave]), setting.save);
//#endregion
