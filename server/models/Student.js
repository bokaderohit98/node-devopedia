const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  img: {
    type: String
  },
  info: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "student"
  },
  courses: [{
    type: mongoose.Schema.ObjectId,
    ref: 'course'
  }],
  isStudent: {
    type: Boolean,
    default: true
  },
  date: {
    type: Date,
    default: Date.now(),
  }
});

const Student = mongoose.model('student', StudentSchema);

module.exports = Student;
