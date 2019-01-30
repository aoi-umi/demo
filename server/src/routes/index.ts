import * as express from 'express';
let router = express.Router();
export default router;

import * as bookmark from './bookmark';
//#region bookmark 
router.get('/bookmark/query', bookmark.bookmarkQuery);
router.post('/bookmark/save', bookmark.bookmarkSave);
router.post('/bookmark/del', bookmark.bookmarkDel);
//#endregion
