var express = require('express');
var exports = module.exports;
exports.get = function (req, res, next) {
  res.render('index', { title: 'Express', method:'get' });
};
exports.post = function (req, res, next) {
  res.render('index', { title: 'Express', method:'post' });
};

exports.index = function (req, res, next) {
  res.render('index', { title: 'Express', method:'index' });
};
