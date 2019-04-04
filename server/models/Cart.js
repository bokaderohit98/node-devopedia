const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CartSchema = new Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'student',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'course',
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

var Cart = mongoose.model('cart', CartSchema);

module.exports = Cart;
