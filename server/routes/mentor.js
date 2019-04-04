//Loading models
const Mentor = require('../models/Mentor');
const Course = require('../models/Course');
const CourseRequest = require('../models/CourseRequest');
const Lesson = require('../models/Lesson');
const EditRequest = require('../models/EditRequest');

//Loading dependencies
const bcrypt = require('bcryptjs');
const express = require('express');
const validUrl = require('valid-url');
const router = express.Router();
const validate = require('../helpers/validate');
const authenticate = require('../helpers/auth').isMentor; //middleware to authenticate request
const mentorAuth = require('../config/passport').mentorAuth; //middlelware to login
const emailVerification = require('../helpers/emailVerification');

// Mentor login and register form
router.get('/', (req, res) => {
  var action = '/mentor';
  res.render('body/general/authenticate', {
    action,
  });
});

//Handling mentor login
router.post('/login', mentorAuth);

//Handling mentor registration
router.post('/register', (req, res) => {
  var action = '/mentor'
  var {
    errors,
    newUser
  } = validate.register(req);
  if (errors) {
    res.render('body/general/authenticate', {
      errors,
      newUser,
      action
    });
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          newUser.password = hash;
          emailVerification.sendVerificationMail(req, res, newUser, Mentor);
        }
      });
    });
  }
});

//Confirming registered email
router.get('/confirm/:url', (req, res) => {
  var verificationUrl = req.params.url;
  emailVerification.confirmEmail(req, res, verificationUrl, Mentor);
});

//Mentor Dashboard
router.get('/dashboard', authenticate, (req, res) => {
  res.render('body/mentor/home', {
    layout: 'dashboard',
    header: 'Dashboard'
  });
});

//Mentor profile form
router.get('/profile', authenticate, (req, res) => {
  res.render('body/mentor/profile', {
    layout: 'dashboard',
    header: 'Profile'
  });
});

//Editing profile
router.post('/profile', authenticate, (req, res) => {
  var {
    errors,
    newProfile
  } = validate.profile(req);

  if (errors) {
    res.render('body/mentor/profile', {
      layout: 'dashboard',
      header: 'Profile',
      errors
    });
  } else {
    Mentor.findByIdAndUpdate(req.user._id, newProfile)
      .then(() => {
        req.flash('success_msg', 'Profile updated successfully');
        res.redirect('/mentor/profile');
      }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Some internal error occured');
        res.redirect('/mentor/profile');
      });
  }
});

//Course Requests
router.get('/course-request', authenticate, (req, res) => {
  CourseRequest.find({
    approved: true
  }).then((approvedCourseRequests) => {
    res.render('body/general/courseRequests', {
      layout: 'dashboard',
      approvedCourseRequests,
      header: 'Course Request'
    });
  });
});

//Edit Request
//Rendering edit request form
router.get('/edit-request/:id', authenticate, (req, res) => {
  res.render('body/mentor/editRequest', {
    layout: 'dashboard',
    header: 'Edit Request',
    course: req.params.id
  });
});

//Posting an edit request
router.post('/edit-request/:id', authenticate, (req, res) => {
  var {
    errors,
    newEditRequest
  } = validate.editRequest(req);

  if (errors) {
    req.flash('error_msg', 'Please provide a better description');
    res.redirect(`/mentor/edit-request/${req.params.id}`);
  }
  newEditRequest.author = req.user._id;
  new EditRequest(newEditRequest)
    .save()
    .then(() => {
      req.flash('success_msg', 'Edit request has been sent to the admin');
      res.redirect('/course/my-courses');
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error Occured');
      res.redirect('/course/my-courses');
    });
});

//Displaying all edit requests
router.get('/edit-request', authenticate, (req, res) => {
  EditRequest.find({
    author: req.user._id
  }).then((editRequests) => {
    return new Promise((resolve, reject) => {
      editRequests.forEach((editRequest) => {
        Course.findById(editRequest.course)
          .then((course) => {
            editRequest.title = course.title;
          }).catch(err => reject());
      });
      resolve(editRequests);
    });
  }).then((editRequests) => {
    res.render('body/general/editRequests', {
      layout: 'dashboard',
      editRequests,
      header: 'My Edit Requests'
    });
  }).catch((err) => {
    console.log(err);
    req.flash('error_msg', 'Some internal error occured');
    res.redirect('/mentor/dashboard');
  });
});

//Deleting edit request
router.delete('/edit-request/:id', authenticate, (req, res) => {
  EditRequest.findByIdAndRemove(req.params.id)
    .then(() => {
      req.flash('success_msg', 'Edit request removed');
      res.redirect('/mentor/edit-request');
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error occured');
      res.redirect('/mentor/edit-request');
    });
});

//Search
router.post('/search', authenticate, (req, res) => {
  if (req.body.query.length === 0) {
    res.redirect('/mentor/dashboard');
  } else {
    var query = {
      $regex: req.body.query,
      $options: 'i'
    };

    var renderObject = {};

    Course.find({
      approved: true,
      title: query,
      author: req.user._id
    }).then((approvedCourses) => {
      renderObject.approvedCourses = approvedCourses;
      return Course.find({
        approved: false,
        title: query,
        author: req.user._id
      });
    }).then((unapprovedCourses) => {
      renderObject.unapprovedCourses = unapprovedCourses;
      return Course.find({
        approved: true,
        title: query,
        author: {
          $ne: req.user._id
        }
      });
    }).then((courses) => {
      renderObject.courses = courses;
      res.render('body/general/search', {
        layout: 'dashboard',
        header: 'Search Results',
        courses: renderObject.courses,
        approvedCourses: renderObject.approvedCourses,
        unapprovedCourses: renderObject.unapprovedCourses
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error occured');
      res.redirect('/mentor/dashboard');
    });
  }
});

//Rendering total earnings
router.get('/earnings', authenticate, (req, res) => {
  res.render('body/mentor/earnings', {
    layout: 'dashboard'
  });
});

//Logout
router.get('/logout', authenticate, (req, res) => {
  req.logout();
  req.flash('success_msg', 'You have been logged out');
  res.redirect('/mentor');
});

//Error 404
router.get('*', authenticate, (req, res) => {
  if (!req.user) {
    res.redirect('/error');
  }
  res.render('body/general/error404', {
    layout: 'dashboard',
    header: 'Page not found'
  });
});

//Exoprting Router
module.exports = router;
