var express = require('express');
var router = express.Router();
var md = require('node-markdown').Markdown;

const courses = require('../data/data');

/* GET lectures listing. */
router.get('/', function (req, res, next) {
  
  var lectures = [];
  courses.forEach(function (course) {
      course.lectures.forEach(function (lecture) {
          lectures.push(lecture);
      });
  });
  res.render('lectures', { title: 'Lectures', lectures: lectures, md: md});
});

/* GET lecture by course and ID */
router.get('/:course/:number', function (req, res, next) {
  var courseId = req.params.course;
  var lectureId = parseInt(req.params.number);
  
  var course = courses.find(course => course.course === courseId);
  var lecture = course.lectures.find(lecture => lecture.id === lectureId);

  var title = `Lecture ${lectureId} in ${courseId}`;
  res.render('lecture', { title: title, lecture: lecture, md: md })
});

/* GET lecture by object ID (mongo) */
router.get('/:id', function (req, res, next) {
    var _id = req.params.id;
    var lectures = [];

    courses.forEach(function (course) {
        course.lectures.forEach(function (lecture) {
            lectures.push(lecture);
        });
    });

    var lecture = lectures.find(lecture => lecture._id === _id);
  
    var title = `Lecture ${lecture.id} in ${lecture.course}`;
    res.render('lecture', { title: title, lecture: lecture, md: md })
  });

module.exports = router;
