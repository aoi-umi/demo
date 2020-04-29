import Router from 'koa-router';
const router = new Router({ prefix: '/test' });
export default router;
import * as test from '../test';

router.get('/get', async (ctx, next) => {
    console.log(test.run());
    ctx.response.body = { a: 'get' };
});
router.post('/post', async (ctx, next) => {
    ctx.response.body = { a: 'post' };
});
