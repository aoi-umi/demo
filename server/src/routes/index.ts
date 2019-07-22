import * as express from 'express';
let router = express.Router();
export default router;
import * as userAuth from '../middleware/userAuth';

//#region user 
import * as user from './user';
router.post('/user/accountExists', userAuth.normal, user.accountExists);
router.post('/user/signUp', userAuth.normal, user.signUp);
router.post('/user/signIn', userAuth.normal, user.signIn);
router.post('/user/signOut', userAuth.normal, user.signOut);
router.get('/user/info', userAuth.normal, user.info);
router.get('/user/detail', userAuth.normal, user.detail);
router.get('/user/mgt/query', userAuth.normal, user.mgtQuery);
router.post('/user/mgt/save', userAuth.normal, user.mgtSave);
router.post('/user/mgt/disable', userAuth.normal, user.mgtDisable);
//#endregion

//#region bookmark 
import * as bookmark from './bookmark';
router.get('/bookmark/query', userAuth.normal, bookmark.query);
router.post('/bookmark/save', userAuth.normal, bookmark.save);
router.post('/bookmark/del', userAuth.normal, bookmark.del);
//#endregion

//#region authority 
import * as authority from './authority';
router.get('/authority/query', userAuth.normal, authority.query);
router.post('/authority/codeExists', userAuth.normal, authority.codeExists);
router.post('/authority/save', userAuth.normal, authority.save);
router.post('/authority/update', userAuth.normal, authority.update);
router.post('/authority/del', userAuth.normal, authority.del);
//#endregion

//#region role 
import * as role from './role';
router.get('/role/query', userAuth.normal, role.query);
router.post('/role/codeExists', userAuth.normal, role.codeExists);
router.post('/role/save', userAuth.normal, role.save);
router.post('/role/update', userAuth.normal, role.update);
router.post('/role/del', userAuth.normal, role.del);
//#endregion

//#region article 
import * as article from './article';
router.get('/article/query', userAuth.normal, article.query);
router.post('/article/save', userAuth.normal, article.save);
router.post('/article/del', userAuth.normal, article.del);
router.post('/article/mgt/audit', userAuth.normal, article.mgtAudit);
//#endregion
