var express = require('express')
var router = express.Router()
var md = require('node-markdown').Markdown
var mongoose = require('mongoose')
var multer = require('multer')

const config = require('../config')
const LectureSchema = require('../schemas/lecture')
const Lecture = mongoose.model('Lecture', LectureSchema)
const CourseSchema = require('../schemas/course')
const Course = mongoose.model('Course', CourseSchema)

var dateConverter = require('../helpers/dateconverter')

/* GET lectures listing. */
router.get('/view', function (req, res, next) {
  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  Lecture.find({}, function (err, lectures) {
    if (err) {
      console.log({ success: false, message: 'An error occurred', err })
      res.json({ success: false, message: 'An error occurred while connecting to the database', err })
    } else {
      // Processed lectures
      var results = []

      for (var i = 0; i < lectures.length; i++) {
        var lecture = lectures[i]

        var courseId = lecture.course
        Course.findById(courseId, function (err, course) {
          if (err) {
            console.log({ success: false, message: 'An error occurred', err })
            res.json({ success: false, message: 'An error occurred while connecting to the database', err })
          } else {
            if (course) {
              var l = lecture.toObject()
              var c = course.toObject()
              var details = {
                _id: c._id,
                id: c.id,
                code: c.code,
                title: c.title,
                semester: c.semester
              }
              l.course_details = details
              l.formatted_date = dateConverter(l.date)
              results.push(l)
              if (i === lectures.length) {
                res.render('lectures', { title: 'Lectures', lectures: results, md: md })
              }
            } else {
              res.status(500).end()
            }
          }
        })
      }
    }
  })

  /* GET lecture by object ID (mongo) */
  router.get('/:id', function (req, res, next) {
    var lectureId = req.params.id

    mongoose.connect(config.dbstring)
      .catch((err) => {
        console.log('DB connection error', err)
      })

    Lecture.findById(lectureId, function (err, lecture) {
      if (err) {
        res.status(500).end()
      } else {
        if (lecture) {
          var courseId = lecture.course
          Course.findById(courseId, function (err, course) {
            if (err) {
              res.status(500).end()
            } else {
              if (course) {
                var l = lecture.toObject()
                var c = course.toObject()
                var details = {
                  _id: c._id,
                  id: c.id,
                  code: c.code,
                  title: c.title,
                  semester: c.semester
                }
                l.course_details = details
                res.json(l)
              } else {
                var response = { success: false, message: 'No matching course was found' }
                console.log(response)
                res.json(response)
              }
            }
          })
        } else {
          var response = { success: false, message: 'No matching lecture was found' }
          console.log(response)
          res.json(response)
        }
      }
    })
  })

  /* GET lecture by object ID render */
  router.get('/view/:id', function (req, res, next) {
    var lectureId = req.params.id

    mongoose.connect(config.dbstring)
      .catch((err) => {
        console.log('DB connection error', err)
      })

    Lecture.findById(lectureId, function (err, lecture) {
      if (err) {
        res.status(500).end()
      } else {
        if (lecture) {
          var courseId = lecture.course
          Course.findById(courseId, function (err, course) {
            if (err) {
              res.status(500).end()
            } else {
              if (course) {
                var l = lecture.toObject()
                var c = course.toObject()
                var details = {
                  _id: c._id,
                  id: c.id,
                  code: c.code,
                  title: c.title,
                  semester: c.semester
                }
                l.course_details = details

                // Get the file containing the notes
                var fs = require('fs')
                var path = require('path')
                var dir = path.join(__dirname, '../')
                var filePath = path.join(dir, l.filePath)

                var notes = ''
                var lectureDate = dateConverter(l.date)

                fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
                  if (err) { throw err }
                  l.notes = data
                  var title = `Lecture ${lectureDate} in ${l.course_details.id}`
                  res.render('lecture', { title: title, lecture: l, notes: notes, md: md })
                })
              } else {
                var response = { success: false, message: 'No matching course was found' }
                console.log(response)
                res.json(response)
              }
            }
          })
        } else {
          var response = { success: false, message: 'No matching lecture was found' }
          console.log(response)
          res.json(response)
        }
      }
    })
  })

  /* GET lectures */
  router.get('/', function (req, res, next) {
    mongoose.connect(config.dbstring)
      .catch((err) => {
        console.log('DB connection error', err)
      })

    Lecture.find({}, function (err, lectures) {
      if (err) {
        console.log({ success: false, message: 'An error occurred', err })
        res.json({ success: false, message: 'An error occurred while connecting to the database', err })
      } else {
        res.json({ success: true, message: 'Successfully delivered all data', lectures: lectures })
      }
    })
  })
})

/* GET upload page. */
router.get('/notes', function (req, res, next) {
  console.log('reached here')
  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  Course.find({}, function (err, courses) {
    if (err) {
      console.log({ success: false, message: 'An error occurred', err })
      res.json({ success: false, message: 'An error occurred while connecting to the database', err })
    } else {
      res.render('upload', { title: 'Upload Notes', courses: courses })
    }
  })
})

/* POST Add lecture */
var fileUpload = multer({ dest: 'public/notes/' })
router.post('/', fileUpload.single('file'), function (req, res, next) {
  // Todo: Add filetype validation
  var file = req.file
  if (file) {
    var fs = require('fs')
    var readline = require('readline')

    var _courseId = req.body.course
    var date = req.body.date ? req.body.date : new Date()
    var title = req.body.title
    var preview = req.body.preview
    var filePath = req.file.path

    if (!title || !preview) {
      fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
          var rd = readline.createInterface({
            input: fs.createReadStream(filePath),
            output: process.stdout,
            console: false
          })

          if (!title) {
            // title = data.split('\n')[0]
            var i = 0
            rd.on('line', function (line) {
              if (i < 1) {
                title = line
                i++
              }
            })
          }
          if (!preview) {
            rd.on('line', function (line) {
              if ((!line.substring('#')) && (!line.substring('-')) && (!line.substring('['))) {
                var i = 0
                if (i < 0) {
                  console.log('CHOICE')
                  console.log(line)
                  preview = line
                  i++
                  rd.close()
                }
              }
            })
          }
        } else {
          console.log(err)
        }
      })
    }

    mongoose.connect(config.dbstring)
      .catch((err) => {
        console.log('DB connection error', err)
      })

    Course.findById(_courseId, function (err, course) {
      if (err) {
        console.log({ success: false, message: 'An error occurred', err })
        res.json({ success: false, message: 'An error occurred while connecting to the database', err })
      } else {
        if (course) {
          var NewLecture = new Lecture({
            course: _courseId,
            date: date,
            filePath: filePath,
            title: title,
            preview: preview
          })
          NewLecture.save()
            .then(() => {
              res.json({ success: true, message: 'Successfully created lecture with title ' + title })
            })
            .catch((err) => {
              console.log(err)
            })
        }
      }
    })
  } else {
    console.log({ success: false, message: 'Missing file' })
    res.json({ success: false, message: 'Missing file' })
  }
})

module.exports = router
