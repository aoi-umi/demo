import Router from 'koa-router';
const router = new Router({ prefix: '/api' });
export default router;

import test from './test';
router.use(test.routes());
