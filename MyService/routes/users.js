var express = require('express');
var router = express.Router();

var exports = module.exports;
exports.testGet = function(req, res) {
  res.send({response:'users respond with a resource'});
};
