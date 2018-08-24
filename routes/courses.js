var express = require('express')
var router = express.Router()
var md = require('node-markdown').Markdown
var mongoose = require('mongoose')

const config = require('../config')
const CourseSchema = require('../schemas/course')
const Course = mongoose.model('Course', CourseSchema)

/* GET lectures listing. */
router.get('/view', function (req, res, next) {
  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  Course.find({}, function (err, courses) {
    if (err) {
      console.log({ success: false, message: 'An error occurred', err })
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

/* GET lecture */
router.get('/:course/:number', function (req, res, next) {
  var courseId = req.params.course
  var lectureId = req.params.number
  var content = '# Introduction to stuff'
  res.render('lecture', { title: 'Lecture' + lectureId, content: content, md: md })
})

/* GET courses */
router.get('/', function (req, res, next) {
  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  Course.find({}, function (err, courses) {
    if (err) {
      console.log({ success: false, message: 'An error occurred', err })
      res.json({ success: false, message: 'An error occurred while connecting to the database', err })
    } else {
      res.json({ success: true, message: 'Successfully delivered all data', courses: courses })
    }
  })
})

/* POST Add course */
router.post('/', function (req, res, next) {
  var id = req.body.id
  var code = req.body.code
  var title = req.body.title
  var lectures = req.body.lectures
  var semester = req.body.semester

  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  Course.findOne({ code: code }, function (err, course) {
    if (err) {
      console.log({ success: false, message: 'An error occurred', err })
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
