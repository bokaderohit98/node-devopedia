const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CourseRequestSchema = new Schema({
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
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'course',
    required: true
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'mentor',
    required: true
  }
});

var EditRequest = mongoose.model('editRequest', CourseRequestSchema);

module.exports = EditRequest;
