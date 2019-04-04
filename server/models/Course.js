const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
  },
  introduction: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'mentor',
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

const Course = mongoose.model('course', CourseSchema);

module.exports = Course;
