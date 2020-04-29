import Router from 'koa-router';
const router = new Router({ prefix: '/test' });
export default router;

router.get('/get', async (ctx, next) => {
    ctx.response.body = { a: 'get' };
});
router.post('/post', async (ctx, next) => {
    ctx.response.body = { a: 'post' };
});
