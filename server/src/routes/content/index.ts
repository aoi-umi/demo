import * as express from 'express';

import { UserAuthMid } from '@/middleware';
import { auth } from '@/config';

let router = express.Router();
export default router;


//#region article 
import * as article from './article';
router.get('/article/mgt/query', UserAuthMid.normal([auth.login]), article.mgtQuery);
router.get('/article/mgt/detailQuery', UserAuthMid.normal([auth.login]), article.mgtDetailQuery);
router.post('/article/mgt/save', UserAuthMid.normal([auth.login]), article.mgtSave);
router.post('/article/mgt/del', UserAuthMid.normal(), article.mgtDel);
router.post('/article/mgt/audit', UserAuthMid.normal([auth.articleMgtAudit]), article.mgtAudit);

router.get('/article/query', UserAuthMid.normal(), article.query);
router.get('/article/detailQuery', UserAuthMid.normal(), article.detailQuery);
//#endregion

//#region video 
import * as video from './video';
router.get('/video/mgt/query', UserAuthMid.normal([auth.login]), video.mgtQuery);
router.get('/video/mgt/detailQuery', UserAuthMid.normal([auth.login]), video.mgtDetailQuery);
router.post('/video/mgt/save', UserAuthMid.normal([auth.login]), video.mgtSave);
router.post('/video/mgt/del', UserAuthMid.normal(), video.mgtDel);
router.post('/video/mgt/audit', UserAuthMid.normal([auth.videoMgtAudit]), video.mgtAudit);

router.get('/video/query', UserAuthMid.normal(), video.query);
router.get('/video/detailQuery', UserAuthMid.normal(), video.detailQuery);
//#endregion

//#region comment 
import * as comment from './comment';
router.post('/comment/submit', UserAuthMid.normal([auth.login]), comment.submit);
router.get('/comment/query', UserAuthMid.normal(), comment.query);
router.post('/comment/del', UserAuthMid.normal(), comment.del);
//#endregion

//#region danmaku 
import * as danmaku from './danmaku';
router.post('/danmaku/submit', UserAuthMid.normal([auth.login]), danmaku.submit);
router.get('/danmaku/query', UserAuthMid.normal(), danmaku.query);
//#endregion

//#region vote 
import * as vote from './vote';
router.post('/vote/submit', UserAuthMid.normal([auth.login]), vote.submit);
//#endregion

//#region favourite 
import * as favourite from './favourite';
router.post('/favourite/submit', UserAuthMid.normal([auth.login]), favourite.submit);
router.get('/favourite/query', UserAuthMid.normal([auth.login]), favourite.query);
//#endregion
