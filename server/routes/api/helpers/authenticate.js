const jwt = require('jsonwebtoken');
const Student = require('../../../models/Student');

module.exports = (req, res, next) => {
  var token = req.query.token || req.headers['x-access-token'];

  if (!token) {
    res.status(400)
    .json({
      success: false,
      message: 'Token not found'
    });
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, student) => {
      if (err) {
        res.status(400)
        .json({
          success: false,
          message: 'Invalid token',
        });
      } else {
        Student.findById(student.id)
        .then((student) => {
          if (!student) {
            res.status(400)
            .json({
              success: false,
              message: 'User not found'
            });
          }
          req.user = student;
          next();
        });
      }
    });
  }
}
