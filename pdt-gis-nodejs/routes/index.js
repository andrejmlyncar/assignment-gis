var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
      title: 'PDT Project Mlyncar',
      dashboard_name: 'PDT Flight App'
  });
});

var db = require('./database_api.js');
router.get('/api/feature1', db.getFeature1);
router.get('/api/feature2', db.getFeature2);
router.get('/api/feature3', db.getFeature3);

module.exports = router;
