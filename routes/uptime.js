var express = require('express');
var router = express.Router();
var mtaUtils = require('../mtaUtils');

router.get('/', function(req, res, next) {
  var downTime           = mtaUtils.getDownTime();	
  var upTimePercentage   = mtaUtils.getUpTimePercentage();
  res.render('uptime', { title: 'Subway Uptime', downtime: downTime, upTimePercentage: upTimePercentage});
});

module.exports = router;
