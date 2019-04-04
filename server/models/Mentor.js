const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MentorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  img: {
    type: String,
    default: '/img/mentor/profile-pic-holder.jpg'
  },
  info: {
    type: String,
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
    default: "mentor"
  },
  isMentor: {
    type: Boolean,
    default: true
  },
  earning: {
    type: Number,
    default: 0
  }
});

const Mentor = mongoose.model('mentor', MentorSchema);

module.exports = Mentor;
