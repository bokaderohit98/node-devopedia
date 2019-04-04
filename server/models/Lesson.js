const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LessonSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
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
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'course',
    required: true
  },
  resource: {
    type: String
  },
});

const Lesson = mongoose.model('lesson', LessonSchema);

module.exports = Lesson;
