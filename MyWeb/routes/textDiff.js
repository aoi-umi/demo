/**
 * Created by bang on 2017-4-17.
 */
var express = require('express');
var router = express.Router();
var memcache = require('./common/memcache.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('textDiff', { title: 'textDiff' });
});

module.exports = router;
