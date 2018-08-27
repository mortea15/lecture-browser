var express = require('express')
var router = express.Router()
var md = require('node-markdown').Markdown
var mongoose = require('mongoose')

const config = require('../config')
const CourseSchema = require('../schemas/course')
const Course = mongoose.model('Course', CourseSchema)
const LectureSchema = require('../schemas/lecture')
const Lecture = mongoose.model('Lecture', LectureSchema)

var dateConverter = require('../helpers/dateconverter')

/* GET courses listing. */
router.get('/view', function (req, res, next) {
  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  Course.find({}, function (err, courses) {
    if (err) {
      res.json({ success: false, message: 'An error occurred while connecting to the database', err })
    } else {
      var results = []

      courses.forEach(function (course) {
        var courseId = course._id
        Lecture.find({ course: courseId }, function (err, lectures) {
          if (err) {
            res.json({ success: false, message: 'An error occurred while connecting to the database', err })
          } else {
            if (lectures) {
              var r = []

              var c = course.toObject()
              var details = {
                _id: c._id,
                id: c.id,
                code: c.code,
                title: c.title,
                semester: c.semester
              }

              lectures.forEach(function (lecture) {
                var l = lecture.toObject()
                l.formatted_date = dateConverter(l.date)
                l.course_details = details
                r.push(l)
              })
              c.lectures = r
              results.push(c)
              if (results.length === courses.length) {
                res.locals = res.locals ? res.locals : {}
                res.locals.courses = results
                res.render('courses', { title: 'Courses', md: md })
              }
            } else {
              res.status(500).end()
            }
          }
        })
      })
    }
  })
})

/* GET lectures listing. */
router.get('/view', function (req, res, next) {
  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  Course.find({}, function (err, courses) {
    if (err) {
      res.json({ success: false, message: 'An error occurred while connecting to the database', err })
    } else {
      var courseNames = []
      courses.forEach(function (course) {
        courseNames.push(course.code)
      })
      res.render('courses', { title: 'Courses', courses: courses, courseNames: courseNames, md: md })
    }
  })
})

/* GET courses */
router.get('/', function (req, res, next) {
  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  Course.find({}, function (err, courses) {
    if (err) {
      res.json({ success: false, message: 'An error occurred while connecting to the database', err })
    } else {
      res.json({ success: true, message: 'Successfully delivered all data', courses: courses })
    }
  })
})

/* POST Add course */
router.post('/', function (req, res, next) {
  const id = req.sanitize(req.body.id)
  const code = req.sanitize(req.body.code)
  const title = req.sanitize(req.body.title)
  const lectures = req.sanitize(req.body.lectures)
  const semester = req.sanitize(req.body.semester)

  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  Course.findOne({ code: code }, function (err, course) {
    if (err) {
      res.json({ success: false, message: 'An error occurred while connecting to the database', err })
    } else {
      if (!course) {
        const NewCourse = new Course({
          id: id,
          code: code,
          title: title,
          lectures: lectures,
          semester: semester
        })

        NewCourse.save()
          .then(() => {
            res.json({ success: true, message: 'Successfully created course with code' + code })
          })
      } else {
        res.json({ success: false, message: 'A course with that code already exists' })
      }
    }
  })
})

module.exports = router
