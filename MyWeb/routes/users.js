var express = require('express');
var router = express.Router();
var account = require('../bll/account');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('welcome,'+ res.locals.user.nickname);
});

module.exports = router;
