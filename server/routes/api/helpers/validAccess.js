const Lesson = require('../../../models/Lesson');

module.exports = (req, res, next) => {
  Lesson.findById(req.params.id)
  .then((lesson) => {
    if (req.user.courses.some((course) => {
      return course.equals(lesson.course);
    })) {
      next();
    } else {
      res.status(400)
      .json({
        success: false,
        message: 'Please purchase the course'
      });
    }
  }).catch((err) => {
    res.status(500).send();
  })
}
