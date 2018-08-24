var mongoose = require('mongoose')

// Schema for use with mongoose
var CourseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  code: {
    type: Number,
    required: true
  },
  title: {
    type: String
  },
  lectures: {
    type: [mongoose.Schema.Types.ObjectId],
    required: false
  },
  semester: {
    type: String,
    required: false
  }
}, { timestamps: true })

module.exports = CourseSchema
