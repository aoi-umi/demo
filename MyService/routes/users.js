
var exports = module.exports;
var common = require('./_system/common');
exports.testGet = function(req, res) {
  res.render('index', common.formatViewtRes({ title: 'HomePage', method:'user' }));
};

exports.testPost = function(req, res) {
  res.send({response:'users respond with a resource'});
};
