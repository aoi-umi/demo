import * as express from 'express';
let router = express.Router();
export default router;
import { userAuthMid, fileMid } from '../middleware';

//#region user 
import * as user from './user';
router.post('/user/accountExists', userAuthMid.normal, user.accountExists);
router.post('/user/signUp', userAuthMid.normal, user.signUp);
router.post('/user/signIn', userAuthMid.normal, user.signIn);
router.post('/user/signOut', userAuthMid.normal, user.signOut);
router.get('/user/info', userAuthMid.normal, user.info);
router.get('/user/detail', userAuthMid.normal, user.detail);
router.get('/user/mgt/query', userAuthMid.normal, user.mgtQuery);
router.post('/user/mgt/save', userAuthMid.normal, user.mgtSave);
router.post('/user/mgt/disable', userAuthMid.normal, user.mgtDisable);
//#endregion

//#region bookmark 
import * as bookmark from './bookmark';
router.get('/bookmark/query', userAuthMid.normal, bookmark.query);
router.post('/bookmark/save', userAuthMid.normal, bookmark.save);
router.post('/bookmark/del', userAuthMid.normal, bookmark.del);
//#endregion

//#region authority 
import * as authority from './authority';
router.get('/authority/query', userAuthMid.normal, authority.query);
router.post('/authority/codeExists', userAuthMid.normal, authority.codeExists);
router.post('/authority/save', userAuthMid.normal, authority.save);
router.post('/authority/update', userAuthMid.normal, authority.update);
router.post('/authority/del', userAuthMid.normal, authority.del);
//#endregion

//#region role 
import * as role from './role';
router.get('/role/query', userAuthMid.normal, role.query);
router.post('/role/codeExists', userAuthMid.normal, role.codeExists);
router.post('/role/save', userAuthMid.normal, role.save);
router.post('/role/update', userAuthMid.normal, role.update);
router.post('/role/del', userAuthMid.normal, role.del);
//#endregion

//#region article 
import * as article from './article';
router.get('/article/mgt/query', userAuthMid.normal, article.mgtQuery);
router.get('/article/mgt/detailQuery', userAuthMid.normal, article.MgtDetailQuery);
router.post('/article/mgt/save', userAuthMid.normal, article.mgtSave);
router.post('/article/mgt/del', userAuthMid.normal, article.mgtDel);
router.post('/article/mgt/audit', userAuthMid.normal, article.mgtAudit);

router.get('/article/query', userAuthMid.normal, article.query);
router.get('/article/detailQuery', userAuthMid.normal, article.detailQuery);
//#endregion

//#region file 
import * as file from './file';
router.post('/img/upload', userAuthMid.normal, fileMid.single, file.imgUpload);
router.get('/img', userAuthMid.normal, file.imgGet);

//#endregion
