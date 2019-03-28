import * as express from 'express';
let router = express.Router();
export default router;

//#region user 
import * as user from './user';
router.post('/user/accountExists', user.accountExists);
router.post('/user/signUp', user.signUp);
router.post('/user/signIn', user.signIn);
router.post('/user/signOut', user.signOut);
router.post('/user/info', user.info);
router.get('/admin/user/list', user.list);
//#endregion

//#region bookmark 
import * as bookmark from './bookmark';
router.get('/bookmark/query', bookmark.query);
router.post('/bookmark/save', bookmark.save);
router.post('/bookmark/del', bookmark.del);
//#endregion

//#region authority 
import * as authority from './authority';
router.get('/authority/query', authority.query);
router.post('/authority/save', authority.save);
router.post('/authority/update', authority.update);
router.post('/authority/del', authority.del);
//#endregion
