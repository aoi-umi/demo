import * as express from 'express';
let router = express.Router();
export default router;
import { UserAuthMid, FileMid } from '../middleware';
import { auth } from '../config';

//#region user 
import * as user from './user';
router.post('/user/accountExists', UserAuthMid.normal(), user.accountExists);
router.post('/user/signUp', UserAuthMid.normal(), user.signUp);
router.post('/user/signIn', UserAuthMid.normal(), user.signIn);
router.post('/user/signOut', UserAuthMid.normal(), user.signOut);
router.get('/user/info', UserAuthMid.normal([auth.login]), user.info);
router.get('/user/detail', UserAuthMid.normal([auth.login]), user.detail);
router.get('/user/detailQuery', user.detailQuery);
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
import * as authority from './authority';
router.get('/authority/query', UserAuthMid.normal([auth.authorityQuery]), authority.query);
router.post('/authority/codeExists', UserAuthMid.normal(), authority.codeExists);
router.post('/authority/save', UserAuthMid.normal([auth.authoritySave]), authority.save);
router.post('/authority/update', UserAuthMid.normal([auth.authoritySave]), authority.update);
router.post('/authority/del', UserAuthMid.normal([auth.authorityDel]), authority.del);
//#endregion

//#region role 
import * as role from './role';
router.get('/role/query', UserAuthMid.normal([auth.roleQuery]), role.query);
router.post('/role/codeExists', UserAuthMid.normal(), role.codeExists);
router.post('/role/save', UserAuthMid.normal([auth.roleSave]), role.save);
router.post('/role/update', UserAuthMid.normal([auth.roleSave]), role.update);
router.post('/role/del', UserAuthMid.normal([auth.roleDel]), role.del);
//#endregion

//#region article 
import * as article from './article';
router.get('/article/mgt/query', UserAuthMid.normal([auth.login]), article.mgtQuery);
router.get('/article/mgt/detailQuery', UserAuthMid.normal([auth.login]), article.MgtDetailQuery);
router.post('/article/mgt/save', UserAuthMid.normal([auth.login]), article.mgtSave);
router.post('/article/mgt/del', UserAuthMid.normal([auth.articleMgtAudit]), article.mgtDel);
router.post('/article/mgt/audit', UserAuthMid.normal([auth.articleMgtDel]), article.mgtAudit);

router.get('/article/query', UserAuthMid.normal(), article.query);
router.get('/article/detailQuery', UserAuthMid.normal(), article.detailQuery);
//#endregion

//#region comment 
import * as comment from './comment';
router.post('/comment/submit', UserAuthMid.normal([auth.login]), comment.submit);
router.get('/comment/query', UserAuthMid.normal(), comment.query);
router.post('/comment/del', UserAuthMid.normal(), comment.del);
//#endregion

//#region vote 
import * as vote from './vote';
router.post('/vote/submit', UserAuthMid.normal([auth.login]), vote.submit);
//#endregion

//#region follow 
import * as follow from './follow';
router.post('/follow/save', UserAuthMid.normal([auth.login]), follow.save);
//#endregion

//#region file 
import * as file from './file';
router.post('/img/upload', UserAuthMid.normal([auth.login]), FileMid.single, file.imgUpload);
router.get('/img', UserAuthMid.normal(), file.imgGet);

router.get('/video/detail', file.vedioGet);
//#endregion
