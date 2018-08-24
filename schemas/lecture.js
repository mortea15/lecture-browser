var mongoose = require('mongoose')

// Schema for use with mongoose
var LectureSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  filePath: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: false
  },
  preview: {
    type: String,
    required: false
  }
}, { timestamps: true })

module.exports = LectureSchema
