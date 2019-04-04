//Loading dependencies
const bcrypt = require('bcryptjs');

//Loading models
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

module.exports = {
  //Method to authenticate in passport
  check: (user, password, done) => {
    if (user) {
      bcrypt.compare(password, user.password).then((result) => {
        if (!result) {
          return done(null, false, {
            message: 'Email and Password does not match.'
          });
        } else {
          return done(null, user);
        }
      }).catch((err) => {
        console.log(err);
      });
    } else {
      return done(null, false, {
        message: 'User not found'
      });
    }
  },

  isStudent: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'student') {
      next();
    } else {
      req.flash('error_msg', 'You are not authorized');
      res.redirect('/student');
    }
  },

  isMentor: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'mentor') {
      next();
    } else {
      req.flash('error_msg', 'You are not authorized');
      res.redirect('/mentor');
    }
  },

  isAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      next();
    } else {
      req.flash('error_msg', 'You are not authorized');
      res.redirect('/admin');
    }
  },

  isUser: (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      req.flash('error_msg', 'You are not authorized');
      res.redirect('/');
    }
  },

  isAdminOrMentor: (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      next();
    } else if (req.isAuthenticated && req.user.isMentor) {
      var id = req.params.id;
      Course.findById(id)
        .then((course) => {
          if (course.author === req.user._id) {
            next();
          } else {
            req.flash('error_msg', 'You are unauthorized');
            res.redirect('/mentor/dashboard');
          }
        }).catch((err) => {
          console.log(err);
          req.flash('error_msg', 'Some internal error Occured');
          res.redirect('/');
        })
    } else {
      req.flash('error_msg', 'You are not authorized');
      res.redirect('/');
    }
  },

  isStudentOrMentor: (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.isMentor || req.user.isStudent) {
        next();
      }
    } else {
      req.flash('error_msg', 'You are not authorized');
      res.redirect('/');
    }
  },

  isValidUser: (req, res, next) => {
    var user = req.user;
    if (req.isAuthenticated() && user.isAdmin) {
      next();
    } else if (req.isAuthenticated && user.isStudent) {
      Lesson.findById(req.params.id)
        .then((lesson) => {
          if (user.courses.some((course) => {
              return course.equals(lesson.course);
            })) {
            next();
          } else {
            req.flash('error_msg', 'You are not authorized');
            res.redirect('/student');
          }
        }).catch((err) => {
          console.log(err);
          req.flash('error_msg', 'Some internal error occured');
          res.redirect('/student');
        });
    } else if (req.isAuthenticated() && user.isMentor) {
      Lesson.findById(req.params.id)
        .then((lesson) => {
          return Course.findById(lesson.course);
        }).then((course) => {
          if (course.author.equals(user._id)) {
            next();
          } else {
            req.flash('error_msg', 'You are not authorized');
            res.redirect('/mentor');
          }
        }).catch((err) => {
          console.log(err);
          req.flash('error_msg', 'Some internal error occured');
          res.redirect('/');
        })
    } else {
      req.flash('error_msg', 'You are not authorized');
      res.redirect('/');
    }
  },

  isOwner: (req, res, next) => {
    console.log('in here');
    if (!req.isAuthenticated()) {
      req.flash('error_msg', 'You are not authorized');
      res.redirect('/');
    }

    var user = req.user;

    if (!user.isMentor) {
      req.flash('error_msg', 'You are not authorized');
      res.redirect('/');
    }
    var id;
    if (req.params.id) {
      id = req.params.id;
    } else if (req.body.course) {
      id = req.body.course;
    }
    Course.findById(id)
      .then((course) => {
        if (course.author.equals(user._id)) {
          next();
        } else {
          req.flash('error_msg', 'You are not the owner of this course');
          res.redirect('/mentor/dashboard');
        }
      }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Some internal error Occured');
        res.redirect('/mentor/dashboard');
      });
  },

  isLessonOwner: (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash('error_msg', 'You are not authorized');
      res.redirect('/');
    }

    var user = req.user;

    if (!user.isMentor) {
      req.flash('error_msg', 'You are not authorized');
      res.redirect('/');
    }
    var id = req.params.id;
    Lesson.findById(id)
    .then((lesson) => {
      return Course.findById(lesson.course);
    }).then((course) => {
        if (course.author.equals(user._id)) {
          next();
        } else {
          req.flash('error_msg', 'You are not the owner of this course');
          res.redirect('/mentor/dashboard');
        }
      }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Some internal error Occured');
        res.redirect('/mentor/dashboard');
      });
  }
};
