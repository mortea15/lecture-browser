var mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  username: String,
  password: String,
  admin: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  courses: [mongoose.Schema.Types.ObjectId]
}, { timestamps: true })
