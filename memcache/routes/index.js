var express = require('express');
var router = express.Router();
var memcache = require('./memcache.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'memcache' });
});

router.post('/link', function(req, res, next) {
  try {
    var reqData = req.body;
    var host = reqData.host;
    memcache.link(host);
    res.send({success:1});
  }catch (err){
    res.send({success:0, err:err.toString()});
  }
});

router.post('/query', function(req, res, next) {
    var reqData = req.body;
    var key = reqData.key;
    var args = {
        key: key
    };
    try {
    memcache.getItems(args, function(err, result){
      if(err) return res.send({success: 0, data: err.toString()});
      res.send({success:1, data: result});
    });
    }catch (err){
    res.send({success:0, data:err.toString()});
    }
});

router.post('/detailQuery', function(req, res, next) {
  try {
    var reqData = req.body;
    var key = reqData.key;
    memcache.get(key, function (err, result) {
      if (err) return res.send({success: 0, data: err.toString()});
      res.send({success: 1, data: result});
    });
  } catch (err) {
    res.send({success: 0, data: err.toString()});
  }
});

router.post('/delKey', function(req, res, next) {
  try {
    var reqData = req.body;
    var key = reqData.key;
    memcache.delete(key, function (err) {
      if (err) return res.send({success: 0, data: err.toString()});
      res.send({success: 1});
    });
  } catch (err) {
    res.send({success: 0, data: err.toString()});
  }
});

router.post('/delNullKey', function(req, res, next) {
  try {
    memcache.getItems(null,function(err, result){
      if(err) throw err;
      var delCount = 0;
      var finishedCount = 0;

      result.forEach(function(t){
        memcache.get(t.data.key, function (err, result1) {
          if (!err && !result1) {
            memcache.delete(t.data.key, function(err){
              if(!err) ++delCount;
              ++finishedCount;
              if(finishedCount == result.length){
                res.send({success:1, data: '删除' + delCount + '项'});
              }
            });
          }else {
            ++finishedCount;
            if(finishedCount == result.length){
              res.send({success:1, data: '删除' + delCount + '项'});
            }
          }
        });
      });
    });
  }catch (err){
    res.send({success:0, data:err.toString()});
  }
})

module.exports = router;
