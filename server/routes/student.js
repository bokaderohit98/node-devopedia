//Loading models
const Student = require('../models/Student');
const CourseRequest = require('../models/CourseRequest');
const Mentor = require('../models/Mentor');
const Course = require('../models/Course');
const Cart = require('../models/Cart');
const _ = require('underscore');

//Loading dependencies
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const validate = require('../helpers/validate');
const authenticate = require('../helpers/auth').isStudent; //middleware to authenticate request
const auth = require('../config/passport').studentAuth; //middlelware to login
const emailVerification = require('../helpers/emailVerification'); //email verification during registration

//Student login and reigster form
router.get('/', (req, res) => {
  var action = '/student';
  res.render('body/general/authenticate', {
    action
  });
});

//Handling student login
router.post('/login', auth);

//Handling student registration
router.post('/register', (req, res) => {
  var action = '/student';
  var {
    errors,
    newUser
  } = validate.register(req);
  if (errors) {
    res.render('body/general/authenticate', {
      errors,
      newUser,
      action,
    });
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          newUser.password = hash;
          emailVerification.sendVerificationMail(req, res, newUser, Student);
        }
      });
    });
  }
});

//Confirming registered email
router.get('/confirm/:url', (req, res) => {
  var verificationUrl = req.params.url;
  emailVerification.confirmEmail(req, res, verificationUrl, Student);
});

//Student Dashboard
router.get('/dashboard', authenticate, (req, res) => {
  res.render('body/student/home', {
    layout: 'dashboard',
    header: 'Dashboard'
  });
});

//Getting list of mentors
router.get('/mentors', authenticate, (req, res) => {
  Mentor.find({}, {
      'name': 1,
      'img': 1,
      'info': 1
    })
    .then((mentors) => {
      res.render('body/student/mentors', {
        layout: 'dashboard',
        mentors,
        header: 'Know Your Mentors'
      });
    }).catch((err) => {
      req.flash('error_msg', 'Some internal error Occured');
      res.redirect('/student/dashboard');
    });
});

//Posting course Request
router.post('/course-request', authenticate, (req, res) => {
  var {
    errors,
    newCourseRequest
  } = validate.courseRequest(req);

  if (errors) {
    req.flash('error_msg', 'All feilds are mandatory');
    res.redirect('/student/dashboard');
  } else {
    newCourseRequest.author = req.user._id;
    new CourseRequest(newCourseRequest)
      .save()
      .then(() => {
        req.flash('success_msg', 'Course request has been submitted successfully. We will get to you soon');
        res.redirect('/student/dashboard');
      }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Some internal error Occured');
        res.redirect('/student/dashboard');
      });
  }
});

//Search
router.post('/search', authenticate, (req, res) => {
  if (req.body.query.length === 0) {
    res.redirect('/student/dashboard');
  } else {

    var query = {
      $regex: req.body.query,
      $options: 'i'
    };

    var renderObject = {};

    Course.find({
        approved: true,
        title: query
      }).where('_id').in(req.user.courses)
      .then((myCourses) => {
        renderObject.myCourses = myCourses;
        return Course.find({
          approved: true,
          title: query,
          _id: {
            $nin: req.user.courses
          }
        });
      }).then((courses) => {
        renderObject.courses = courses;
        console.log(renderObject);
        res.render('body/general/search', {
          layout: 'dashboard',
          header: 'Search Results',
          courses: renderObject.courses,
          myCourses: renderObject.myCourses
        });
      }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Some internal error occured');
        res.redirect('/student/dashboard');
      });
  }
});

//Cart
router.get('/cart/:id', authenticate, (req, res) => {
  var renderObject = {};
  Cart.find({
    student: req.params.id
  }).then((items) => {
    var len = items.length;
    var count = 0;
    return new Promise((resolve, reject) => {
      items.forEach((item) => {
        Course.findById(item.course)
        .then((course) => {
          item.course = course;
          count++;
        }).catch((err) => {
          reject(err);
        });
      });
      var interval = setInterval(() => {
        if(count === len) {
          clearInterval(interval);
          resolve(items);
        }
      }, 5);
    });
  }).then((items) => {
    var price = 0;
    if (items.length > 0) {
      items.forEach((item) => {
        price += item.course.price;
      });
    }
    res.render('body/student/cart', {
      layout: 'dashboard',
      header: 'My Cart',
      items,
      price,
    });
  }).catch((err) => {
    console.log(err);
    req.flash('error_msg', 'Some internal error Occured');
    res.redirect('/student/dashboard');
  })
});

//Removing an item from the Cart
router.delete('/cart/:id', authenticate, (req, res) => {
  Cart.findByIdAndRemove(req.params.id)
  .then(() => {
    req.flash('success_msg', 'Item removed successfully from the cart');
    res.redirect(`/student/cart/${req.user._id}`);
  }).catch((err) => {
    console.log(err);
    req.flash('error_msg', 'Some internal error Occured');
    res.redirect(`{/student/cart/${req.user._id}`);
  });
});

//Logout
router.get('/logout', authenticate, (req, res) => {
  req.logout();
  req.flash('success_msg', 'You have been logged out');
  res.redirect('/student');
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
