import * as express from 'express';
let router = express.Router();
export default router;
import { UserAuthMid, FileMid } from '../middleware';
import { auth } from '../config';

//#region user 
import * as user from './user';
router.post('/user/accountExists', UserAuthMid.normal, user.accountExists);
router.post('/user/signUp', UserAuthMid.normal, user.signUp);
router.post('/user/signIn', UserAuthMid.normal, user.signIn);
router.post('/user/signOut', UserAuthMid.normal, user.signOut);
router.get('/user/info', UserAuthMid.normalV2([auth.login]), user.info);
router.get('/user/detail', UserAuthMid.normalV2([auth.login]), user.detail);
router.post('/user/update', UserAuthMid.normal, user.update);
router.get('/user/mgt/query', UserAuthMid.normal, user.mgtQuery);
router.post('/user/mgt/save', UserAuthMid.normal, user.mgtSave);
router.post('/user/mgt/disable', UserAuthMid.normal, user.mgtDisable);
//#endregion

//#region bookmark 
import * as bookmark from './bookmark';
router.get('/bookmark/query', UserAuthMid.normal, bookmark.query);
router.post('/bookmark/save', UserAuthMid.normal, bookmark.save);
router.post('/bookmark/del', UserAuthMid.normal, bookmark.del);
//#endregion

//#region authority 
import * as authority from './authority';
router.get('/authority/query', UserAuthMid.normal, authority.query);
router.post('/authority/codeExists', UserAuthMid.normal, authority.codeExists);
router.post('/authority/save', UserAuthMid.normal, authority.save);
router.post('/authority/update', UserAuthMid.normal, authority.update);
router.post('/authority/del', UserAuthMid.normal, authority.del);
//#endregion

//#region role 
import * as role from './role';
router.get('/role/query', UserAuthMid.normal, role.query);
router.post('/role/codeExists', UserAuthMid.normal, role.codeExists);
router.post('/role/save', UserAuthMid.normal, role.save);
router.post('/role/update', UserAuthMid.normal, role.update);
router.post('/role/del', UserAuthMid.normal, role.del);
//#endregion

//#region article 
import * as article from './article';
router.get('/article/mgt/query', UserAuthMid.normal, article.mgtQuery);
router.get('/article/mgt/detailQuery', UserAuthMid.normal, article.MgtDetailQuery);
router.post('/article/mgt/save', UserAuthMid.normal, article.mgtSave);
router.post('/article/mgt/del', UserAuthMid.normal, article.mgtDel);
router.post('/article/mgt/audit', UserAuthMid.normal, article.mgtAudit);

router.get('/article/query', UserAuthMid.normal, article.query);
router.get('/article/detailQuery', UserAuthMid.normal, article.detailQuery);
//#endregion

//#region file 
import * as file from './file';
router.post('/img/upload', UserAuthMid.normal, FileMid.single, file.imgUpload);
router.get('/img', UserAuthMid.normal, file.imgGet);

//#endregion
