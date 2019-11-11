import * as express from 'express';
let router = express.Router();
export default router;
import { UserAuthMid, FileMid } from '@/middleware';
import { auth } from '@/config';

//#region user 
import * as user from './user/user';
router.post('/user/accountExists', UserAuthMid.normal(), user.accountExists);
router.post('/user/signUp', UserAuthMid.normal(), user.signUp);
router.post('/user/signIn', UserAuthMid.normal(), user.signIn);
router.post('/user/signOut', UserAuthMid.normal(), user.signOut);
router.get('/user/info', UserAuthMid.normal([auth.login]), user.info);
router.get('/user/detail', UserAuthMid.normal([auth.login]), user.detail);
router.get('/user/detailQuery', UserAuthMid.normal(), user.detailQuery);
router.post('/user/update', UserAuthMid.normal([auth.login]), user.update);
router.get('/user/mgt/query', UserAuthMid.normal([auth.userMgtQuery]), user.mgtQuery);
router.post('/user/mgt/save', UserAuthMid.normal([auth.userMgtEdit]), user.mgtSave);
router.post('/user/mgt/disable', UserAuthMid.normal([auth.userMgtDisable]), user.mgtDisable);
//#endregion

//#region bookmark 
import * as bookmark from './bookmark';
router.get('/bookmark/query', UserAuthMid.normal(), bookmark.query);
router.post('/bookmark/save', UserAuthMid.normal(), bookmark.save);
router.post('/bookmark/del', UserAuthMid.normal(), bookmark.del);
//#endregion

//#region authority 
import * as authority from './user/authority';
router.get('/authority/query', UserAuthMid.normal([auth.authorityQuery]), authority.query);
router.post('/authority/codeExists', UserAuthMid.normal(), authority.codeExists);
router.post('/authority/save', UserAuthMid.normal([auth.authoritySave]), authority.save);
router.post('/authority/update', UserAuthMid.normal([auth.authoritySave]), authority.update);
router.post('/authority/del', UserAuthMid.normal([auth.authorityDel]), authority.del);
//#endregion

//#region role 
import * as role from './user/role';
router.get('/role/query', UserAuthMid.normal([auth.roleQuery]), role.query);
router.post('/role/codeExists', UserAuthMid.normal(), role.codeExists);
router.post('/role/save', UserAuthMid.normal([auth.roleSave]), role.save);
router.post('/role/update', UserAuthMid.normal([auth.roleSave]), role.update);
router.post('/role/del', UserAuthMid.normal([auth.roleDel]), role.del);
//#endregion

//#region article 
import * as article from './content/article';
router.get('/article/mgt/query', UserAuthMid.normal([auth.login]), article.mgtQuery);
router.get('/article/mgt/detailQuery', UserAuthMid.normal([auth.login]), article.mgtDetailQuery);
router.post('/article/mgt/save', UserAuthMid.normal([auth.login]), article.mgtSave);
router.post('/article/mgt/del', UserAuthMid.normal(), article.mgtDel);
router.post('/article/mgt/audit', UserAuthMid.normal([auth.articleMgtAudit]), article.mgtAudit);

router.get('/article/query', UserAuthMid.normal(), article.query);
router.get('/article/detailQuery', UserAuthMid.normal(), article.detailQuery);
//#endregion

//#region video 
import * as video from './content/video';
router.get('/video/mgt/query', UserAuthMid.normal([auth.login]), video.mgtQuery);
router.get('/video/mgt/detailQuery', UserAuthMid.normal([auth.login]), video.mgtDetailQuery);
router.post('/video/mgt/save', UserAuthMid.normal([auth.login]), video.mgtSave);
router.post('/video/mgt/del', UserAuthMid.normal(), video.mgtDel);
router.post('/video/mgt/audit', UserAuthMid.normal([auth.videoMgtAudit]), video.mgtAudit);

router.get('/video/query', UserAuthMid.normal(), video.query);
router.get('/video/detailQuery', UserAuthMid.normal(), video.detailQuery);
//#endregion

//#region comment 
import * as comment from './content/comment';
router.post('/comment/submit', UserAuthMid.normal([auth.login]), comment.submit);
router.get('/comment/query', UserAuthMid.normal(), comment.query);
router.post('/comment/del', UserAuthMid.normal(), comment.del);
//#endregion

//#region danmaku 
import * as danmaku from './content/danmaku';
router.post('/danmaku/submit', UserAuthMid.normal([auth.login]), danmaku.submit);
router.get('/danmaku/query', UserAuthMid.normal(), danmaku.query);
//#endregion

//#region vote 
import * as vote from './content/vote';
router.post('/vote/submit', UserAuthMid.normal([auth.login]), vote.submit);
//#endregion

//#region follow 
import * as follow from './user/follow';
router.post('/follow/save', UserAuthMid.normal([auth.login]), follow.save);
router.get('/follow/query', UserAuthMid.normal(), follow.query);
//#endregion

//#region chat 
import * as chat from './user/chat';
router.post('/chat/submit', UserAuthMid.normal([auth.login]), chat.submit);
router.get('/chat/query', UserAuthMid.normal([auth.login]), chat.query);
router.get('/chat/list', UserAuthMid.normal([auth.login]), chat.list);
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
