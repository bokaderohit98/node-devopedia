const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TempStudentSchema = new Schema({
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

const TempStudent = mongoose.model('tempStudent', TempStudentSchema);

module.exports = TempStudent;
