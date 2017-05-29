var express = require('express');
var router = express.Router();

var exports = module.exports;
exports.get = function(req, res) {
  res.send('admin respond with a resource');
};
