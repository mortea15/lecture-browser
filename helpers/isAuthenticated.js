const mongoose = require('mongoose')
const axios = require('axios')

const config = require('../config')
const UserSchema = require('../schemas/user')
const User = mongoose.model('User', UserSchema)

module.exports = function isAuthenticated (req, res, next) {
  if (req.session.token) {
    axios.post(`${config.host}/user/auth/verify`, { token: req.session.token })
      .then(response => {
        if (response.data.success) {
          var usr = response.data.decoded
          if (usr) {
            mongoose.connect(config.dbstring)
              .catch((err) => {
                console.log('An error occurred while trying to connect to the database')
                throw (err)
              })

            if (usr.username) {
              User.findOne({ username: usr.username }, function (err, user) {
                if (err) {
                  res.status(500).send()
                  console.log('Error:', err)
                } else if (!user) {
                  var error = new Error('An error occurred. Please try logging out and back in')
                  next(error)
                } else {
                  if (user.active) {
                    next()
                  } else {
                    var errInactive = new Error('Please contact an administrator to get your account activated.')
                    res.render('login', { message: 'Please contact an administrator to get your account activated.' })
                    next(errInactive)
                  }
                }
              })
            } else {
              var errUsername = new Error('Missing username in token')
              next(errUsername)
            }
          }
        } else {
          var err = new Error('An error occurred while verifying the token. Please try logging in again')
          next(err)
        }
      })
      .catch(err => {
        var error = new Error('An error occurred while verifying the token. Please try logging in again')
        next(error)
        throw (err)
      })
  } else {
    var error = new Error('Not authenticated')
    res.render('login', { title: 'Log In', message: 'You need to be authenticated in order to view the requested page' })
    next(error)
  }
}
