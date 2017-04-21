var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'index' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'login' });
});

router.get('/test', function(req, res, next) {
  res.render('test');
});

router.post('/IMeiyaTOOrderNotice', function(req, res, next) {
  console.log(req.body);
  res.send({code:20000,desciption:'test'});
});
router.post('/IMeiyaTCOrderNotice', function(req, res, next) {
  console.log(req.body);
    res.send({code:20000,desciption:'test'});
});
router.post('/IMeiyaTROrderNotice', function(req, res, next) {
  console.log(req.body);
    res.send({code:20000,desciption:'test'});
});
router.post('/IMeiyaTVOrderNotice', function(req, res, next) {
  console.log(req.body);
    res.send({code:20000,desciption:'test'});
});

module.exports = router;
