var express = require('express');
var router = express.Router();
var mtaUtils = require('../mtaUtils');
  
router.get('/', function(req, res, next) {
  var MTAStatus = mtaUtils.getMTAStatus();
  res.render('status', {title: 'MTA Subway Status', status: MTAStatus});
});

module.exports = router;