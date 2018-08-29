var express = require('express')
var router = express.Router()
var md = require('node-markdown').Markdown
var mongoose = require('mongoose')
var fs = require('fs')

const config = require('../config')
const LectureSchema = require('../schemas/lecture')
const Lecture = mongoose.model('Lecture', LectureSchema)
const CourseSchema = require('../schemas/course')
const Course = mongoose.model('Course', CourseSchema)

var dateConverter = require('../helpers/dateconverter')

/* GET upload page. */
router.get('/upload', function (req, res, next) {
  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  Course.find({}, function (err, courses) {
    if (err) {
      res.json({ success: false, message: 'An error occurred while connecting to the database', err })
    } else {
      res.render('upload', { title: 'Upload Notes', courses: courses })
    }
  })
})

/* GET lectures listing. */
router.get('/view', function (req, res, next) {
  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  Lecture.find({}, function (err, lectures) {
    if (err) {
      res.json({ success: false, message: 'An error occurred while connecting to the database', err })
    } else {
      // Processed lectures
      var results = []

      lectures.forEach(function (lecture) {
        var courseId = lecture.course
        Course.findById(courseId, function (err, course) {
          if (err) {
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
            } else {
              res.status(500).end()
            }
            if (results.length === lectures.length) {
              res.locals = res.locals ? res.locals : {}
              res.locals.lectures = results
              res.render('lectures', { title: 'Lectures', md: md })
            }
          }
        })
      })
    }
  })
})

/* GET lecture by object ID (mongo) */
router.get('/:id', function (req, res, next) {
  const lectureId = req.sanitize(req.params.id)

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
              res.json(response)
            }
          }
        })
      } else {
        var response = { success: false, message: 'No matching lecture was found' }
        res.json(response)
      }
    }
  })
})

/* GET lecture by object ID render */
router.get('/:id/view', function (req, res, next) {
  var lectureId = req.sanitize(req.params.id)

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
              res.json(response)
            }
          }
        })
      } else {
        var response = { success: false, message: 'No matching lecture was found' }
        res.json(response)
      }
    }
  })
})

/* GET edit lecture by object ID render */
router.get('/:id/edit', function (req, res, next) {
  var lectureId = req.sanitize(req.params.id)

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
              var path = require('path')
              var dir = path.join(__dirname, '../')
              var filePath = path.join(dir, l.filePath)

              var lectureDate = dateConverter(l.date)

              fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
                if (err) { throw err }
                l.notes = data
                var title = `Edit | Lecture ${lectureDate} in ${l.course_details.id}`

                Course.find({}, function (err, courses) {
                  if (err) {
                    res.json({ success: false, message: 'An error occurred while connecting to the database', err })
                  } else {
                    res.render('edit', { title: title, lecture: l, courses: courses })
                  }
                })
              })
            } else {
              var response = { success: false, message: 'No matching course was found' }
              res.json(response)
            }
          }
        })
      } else {
        var response = { success: false, message: 'No matching lecture was found' }
        res.json(response)
      }
    }
  })
})

/* POST save lecture. */
router.post('/save', function (req, res, next) {
  var path = require('path')

  // Params
  const course = req.sanitize(req.body.course)
  const originalCourse = req.sanitize(req.body.originalCourse)
  const content = req.sanitize(req.body.content)
  const lectureId = req.sanitize(req.body.lectureId)
  const filePath = req.sanitize(req.body.filePath)

  // File path
  const parentFolder = path.join(__dirname, '../')
  const fullPath = path.join(parentFolder, filePath)

  if (course && content && lectureId) {
    if (course !== originalCourse) {
      var updatedLecture = {
        course: course
      }
      Lecture.findByIdAndUpdate(lectureId, { $set: updatedLecture }, function (err, lecture) {
        if (err) {
          res.status(404).send()
          throw (err)
        } else {
          console.log(`Lecture updated with Course ID ${course} (Old: ${originalCourse})`)
        }
      })
    }
    fs.writeFile(fullPath, content, 'utf-8', function (err) {
      if (err) throw err
      console.log(content.substring(0, 15))
      console.log('file update complete')
      res.redirect(`/lectures/${lectureId}/view`)
    })
  } else {
    res.json({ success: false, message: 'Missing properties' })
  }
})

/* GET lectures */
router.get('/', function (req, res, next) {
  mongoose.connect(config.dbstring)
    .catch((err) => {
      console.log('DB connection error', err)
    })

  Lecture.find({}, function (err, lectures) {
    if (err) {
      res.json({ success: false, message: 'An error occurred while connecting to the database', err })
    } else {
      res.json({ success: true, message: 'Successfully delivered all data', lectures: lectures })
    }
  })
})

/* POST Add lecture */
var multer = require('multer')
var fileUpload = multer({ dest: 'public/notes/' })
router.post('/upload', fileUpload.single('file'), function (req, res) {
  var file = req.file
  var allowed = config.fileTypes

  if (file && allowed.includes(file.mimetype)) {
    var readline = require('readline')
    var path = require('path')

    var _courseId = req.body.course
    var date = req.body.date ? req.body.date : new Date()
    var title = req.body.title
    var preview = req.body.preview

    var parentFolder = path.join(__dirname, '../')
    var filePath = path.join(parentFolder, file.path)

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
              if (!line.substring('#') && !line.substring('-') && !line.substring('[')) {
                var i = 0
                if (i < 0) {
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
        res.json({ success: false, message: 'An error occurred while connecting to the database ' + err })
      } else {
        if (course) {
          var NewLecture = new Lecture({
            course: _courseId,
            date: date,
            filePath: file.path,
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
        } else {
          res.json({ success: false, message: 'A course with that _id does not exist' })
        }
      }
    })
  } else {
    res.json({ success: false, message: 'Missing file or wrong file type' })
  }
})

module.exports = router
