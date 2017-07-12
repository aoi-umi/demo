var express = require('express');
var exports = module.exports;
var common = require('./_system/common');
exports.get = function (req, res, next) {
  res.render('index', common.formatViewtRes({ title: 'Express', method:'get' }));
};
exports.post = function (req, res, next) {
  res.send(common.formatRes(null, 'post'));
};

exports.index = function (req, res, next) {
  res.render('index', common.formatViewtRes({ title: 'Express', method:'index' }));
};

exports.params = function (req, res, next) {
  console.log(req.params);
  console.log(req.query);
  res.render('index', common.formatViewtRes({ title: 'Express', method:'params' }));
};
