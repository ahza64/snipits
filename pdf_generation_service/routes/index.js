var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.use('/pdf', require(CWD + '/resources/pdf/pdf-routes'));
router.use('/csv', require(CWD + '/resources/csv/csv-routes'));

module.exports = router;

