const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TempMentorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  verificationUrl: {
    type: String
  }
});

const TempMentor = mongoose.model('tempMentor', TempMentorSchema);

module.exports = TempMentor;
