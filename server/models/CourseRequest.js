const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CourseRequestSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now()
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'student',
    required: true
  }
});

var CourseRequest = mongoose.model('courseRequest', CourseRequestSchema);

module.exports = CourseRequest;
