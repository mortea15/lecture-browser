var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const config = require('../config')
const UserSchema = require('../schemas/user')
const User = mongoose.model('User', UserSchema)

/* GET home page. */
router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Log In' })
})

router.get('/logout', function (req, res, next) {
  req.session.destroy(function () {
    console.log('User logged out')
  })
  res.redirect('/')
})

router.post('/auth', function (req, res) {
  const username = req.sanitize(req.body.username)
  const password = req.sanitize(req.body.password)

  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  User.findOne({ username: username }, function (err, user) {
    if (err) {
      res.status(500).send()
    } else {
      if (user !== null) {
        var pwHash = user.password
        var pwTest = bcrypt.compareSync(password, pwHash)
        if (pwTest) {
          // Create a token, return
          var payload = {
            username: username,
            admin: user.admin,
            courses: user.courses,
            active: user.active
          }
          var token = jwt.sign(payload, config.appsecret, {
            expiresIn: '1 day'
          })
          req.session = req.session ? req.session : {}
          req.session.token = token
          res.redirect('/')
        } else {
          res.render('login', { message: 'Invalid login' })
        }
      } else {
        res.render('login', { message: 'Invalid login' })
      }
    }
  })
})

router.post('/auth/verify', function (req, res) {
  var token = req.sanitize(req.body.token)
  jwt.verify(token, config.appsecret, function (err, decoded) {
    if (err) {
      res.json({ success: false, message: 'Invalid token' })
    } else {
      res.json({ success: true, message: 'Valid token', decoded: decoded })
    }
  })
})

router.get('/register', function (req, res) {
  res.render('register', { title: 'Register' })
})

router.post('/auth/register', function (req, res) {
  const username = req.sanitize(req.body.username)
  const email = req.sanitize(req.body.email)
  const password = req.sanitize(req.body.password)
  const passwordConf = req.sanitize(req.body.password2)

  if (username && password && passwordConf) {
    if (password !== passwordConf) {
      res.render('register', { success: false, message: 'The passwords do not match. Please try again.' })
    } else {
      mongoose.connect(config.dbstring)
        .catch((err) => {
          console.log('DB connection error', err)
        })
      User.findOne({ username: username }, function (err, user) {
        if (err) {
          res.json({ success: false, message: 'An error occurred. Please try again.' })
        } else {
          if (!user) {
            var pwHash = bcrypt.hashSync(password, 8)
            const NewUser = new User({
              username: username,
              email: email,
              password: pwHash
            })
            NewUser.save()
              .then(() => {
                res.render('login', { title: 'Log In', success: true, message: 'User successfully created with username ' + username + '. Please contact an admin to get it activated' })
              })
              .catch((err) => {
                res.render('register', { title: 'Register', success: false, message: 'Unable to register user with that username.' })
                throw (err)
              })
          } else {
            res.render('register', { title: 'Register', success: false, message: 'That username has already been taken. Please try another one' })
          }
        }
      })
    }
  } else {
    res.render('register', { title: 'Register', success: false, message: 'Missing credentials' })
  }
})

module.exports = router
