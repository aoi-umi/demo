var express = require('express');
var exports = module.exports;
var common = require('./_system/common');
exports.get = function (req, res, next) {
  res.render('index', { title: 'Express', method:'get' });
};
exports.post = function (req, res, next) {
  res.send(common.formatRes(null, 'post'));
};

exports.index = function (req, res, next) {
  res.render('index', { title: 'Express', method:'index' });
};
