var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.token) {
    res.redirect('/courses/view')
  } else {
    res.render('index', { title: 'Lecture Board' })
  }
})

module.exports = router
