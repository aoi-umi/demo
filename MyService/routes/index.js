var express = require('express');
var exports = module.exports;
exports.get = exports.post = function (req, res, next) {
  res.render('index', { title: 'Express' });
}
