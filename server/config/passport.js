//Loading dependencies
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const auth = require('../helpers/auth')

//Loading models
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const Admin = require('../models/Admin');

//Defining student Strategy
passport.use('student', new localStrategy({
    usernameField: 'email'
  },
  (email, password, done) => {
    Student.findOne({
      email
    }).then((user) => {
      auth.check(user, password, done);
    });
  }));

//Defining mentor Strategy
passport.use('mentor', new localStrategy({
    usernameField: 'email'
  },
  (email, password, done) => {
    Mentor.findOne({
      email
    }).then((user) => {
      auth.check(user, password, done);
    });
  }));

//Defining admin Strategy
passport.use('admin', new localStrategy({
    usernameField: 'email'
  },
  (email, password, done) => {
    Admin.findOne({
      email
    }).then((user) => {
      auth.check(user, password, done);
    });
  }));

//Serializing user
passport.serializeUser((user, done) => {
  done(null, {
    id: user._id,
    role: user.role
  });
});

//Deserializing user based on id and role
passport.deserializeUser((key, done) => {
  var id = key.id;
  var role = key.role;
  if (role === 'student') {
    Student.findById(id)
      .then((user) => {
        done(null, user);
      }).catch((err) => {
        done(err);
      });
  } else if (role === 'mentor') {
    Mentor.findById(id)
      .then((user) => {
        done(null, user);
      }).catch((err) => {
        done(err);
      });
  } else {
    Admin.findById(id)
      .then((user) => {
        done(null, user);
      }).catch((err) => {
        done(err);
      });
  }
});

//Exporting methods
module.exports = {
  passport,

  studentAuth: (req, res, next) => {
    passport.authenticate('student', {
      successRedirect: '/student/dashboard',
      failureRedirect: '/student',
      failureFlash: true
    })(req, res, next);
  },

  mentorAuth: (req, res, next) => {
    passport.authenticate('mentor', {
      successRedirect: '/mentor/dashboard',
      failureRedirect: '/mentor',
      failureFlash: true
    })(req, res, next);
  },

  adminAuth: (req, res, next) => {
    passport.authenticate('admin', {
      successRedirect: '/admin/dashboard',
      failureRedirect: '/admin',
      failureFlash: true
    })(req, res, next);
  }

};
