import * as express from 'express';

import { UserAuthMid } from '@/middleware';
import { auth } from '@/config';

let router = express.Router();
export default router;

//#region user 
import * as user from './user';
router.post('/user/accountExists', UserAuthMid.normal(), user.accountExists);
router.post('/user/signUp', UserAuthMid.normal(), user.signUp);
router.post('/user/signUpCheck', UserAuthMid.normal(), user.signUpCheck);
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

//#region follow 
import * as follow from './follow';
router.post('/follow/save', UserAuthMid.normal([auth.login]), follow.save);
router.get('/follow/query', UserAuthMid.normal(), follow.query);
//#endregion

//#region chat 
import * as chat from './chat';
router.post('/chat/submit', UserAuthMid.normal([auth.login]), chat.submit);
router.get('/chat/query', UserAuthMid.normal([auth.login]), chat.query);
router.get('/chat/list', UserAuthMid.normal([auth.login]), chat.list);
//#endregion
