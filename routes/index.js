var express = require('express')
var router = express.Router()

const config = require('../config')

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.token) {
    res.redirect('/courses/view')
  } else {
    res.render('index', { title: config.appname })
  }
})

module.exports = router
