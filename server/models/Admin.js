const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
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
    default: "admin"
  },
  isAdmin: {
    type: Boolean,
    default: true
  }
});

const Admin = mongoose.model('admin', AdminSchema);

module.exports = Admin;
