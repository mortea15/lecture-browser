var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const session = require('express-session')

var indexRouter = require('./routes/index')
var coursesRouter = require('./routes/courses')
var lecturesRouter = require('./routes/lectures')
var userRouter = require('./routes/user')

const isAuthenticated = require('./helpers/isAuthenticated')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Session
var sess = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 86400000,
    path: '/'
  }
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
  sess.cookie.secure = true
}

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session(sess))

app.get('*', function (req, res, next) {
  res.locals.token = req.session.token || null
  next()
})

app.use('/', indexRouter)
app.use('/courses', isAuthenticated, coursesRouter)
app.use('/lectures', isAuthenticated, lecturesRouter)
app.use('/user', userRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
