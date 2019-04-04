const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var MessageSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

var Message = mongoose.model('message', MessageSchema);

module.exports = Message;
