var mongoose = require('mongoose')

var LogSchema = new mongoose.Schema({
  source: String, // frontend, backend, database
  message: String
}, { timestamps: true })

module.exports = LogSchema
