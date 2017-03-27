var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  setTimeout(function(){
    res.render('users', { title: new Date().toString() });
    //res.send('respond with a resource');
  }, 5000);
});

module.exports = router;
