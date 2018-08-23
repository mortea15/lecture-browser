var express = require('express');
var router = express.Router();
var md = require('node-markdown').Markdown;

const courses = require('../data/data');

/* GET lectures listing. */
router.get('/', function (req, res, next) {
  var courseNames = [];
  courses.forEach(function (course) {
    courseNames.push(course.course);
  });
  res.render('courses', { title: 'Lectures', courses: courses, courseNames: courseNames, md: md});
});

/* GET lecture */
router.get('/:course/:number', function (req, res, next) {
  var courseId = req.params.course;
  var lectureId = req.params.number;
  var content = '# Introduction to stuff';
  res.render('lecture', { title: 'Lecture' + lectureId, content: content, md: md })
})

module.exports = router;
