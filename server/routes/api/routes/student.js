//Loading dependencies
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Loading models
const Student = require('../../../models/Student');
const CourseRequest = require('../../../models/CourseRequest');
const Mentor = require('../../../models/Mentor');
const Course = require('../../../models/Course');
const Cart = require('../../../models/Cart');
const Lesson = require('../../../models/Lesson');

//Loading authentication middleware
const authenticate = require('../helpers/authenticate');
const validAccess = require('../helpers/validAccess');

//Signing in
router.post('/authenticate', (req, res) => {
  Student.findOne({
    email: req.body.email
  }).then((student) => {
    if (!student) {
      res.status(400)
        .json({
          success: false,
          message: 'User not found'
        });
    } else if (student) {
      bcrypt.compare(req.body.password, student.password, (err, result) => {
        if (!result) {
          res.status(400)
            .json({
              success: false,
              message: "Email and Password doesn't match"
            });
        } else {
          const payload = {
            id: student._id,
          };
          var token = jwt.sign(payload, process.env.JWT_SECRET);
          res.status(200)
            .json({
              success: true,
              message: 'Successfully logged in',
              token,
            });
        }
      });
    }
  }).catch((err) => {
    res.status(500).send();
  });
});


//Home
router.get('/', authenticate, (req, res) => {
  var renderObject = {};
  Course.find({
    approved: true,
  })
  .limit(5)
  .then((courses) => {
    renderObject.courses = courses;
    return Course.find({
      approved: true,
      _id: {
        $in: req.user.courses
      }
    });
  }).then((myCourses) => {
    renderObject.myCourses = myCourses;
    res.status(200)
    .json(renderObject);
  }).catch((err) => {
    res.status(500).send();
  });
});

//Listing all Mentors
router.get('/mentors', authenticate, (req, res) => {
  Mentor.find({})
    .then((mentors) => {
      res.status(200)
        .json(mentors);
    }).catch((err) => {
      res.status(500).send();
    });
});

//Listing all courses not purchased by student
router.get('/courses', authenticate, (req, res) => {
  Course.find({
      approved: true,
      _id: {
        $nin: req.user.courses
      }
    })
    .then((courses) => {
      res.status(200)
        .json(courses);
    }).catch((err) => {
      res.status(500).send();
    });
});

//Listing all courses purchased by student
router.get('/my-courses', authenticate, (req, res) => {
  Course.find({
    approved: true,
    _id: {
      $in: req.user.courses
    }
  }).then((courses) => {
    res.status(200)
      .json(courses);
  }).catch((err) => {
    res.status(500).send();
  });
});

//Processing a course Request
router.post('/course-request', authenticate, (req, res) => {
  new CourseRequest({
      title: req.body.title,
      description: req.body.description,
      author: req.user._id,
    })
    .save()
    .then(() => {
      res.status(200)
        .json({
          success: true,
          message: 'Course request submitted'
        });
    }).catch((err) => {
      res.status(500).send();
    });
});

//Displaying a specific course
router.get('/course/:id', authenticate, (req, res) => {
  var renderObject = {};
  renderObject.validAccess = req.user.courses.some((course) => {
    return course.equals(req.params.id);
  });
  Course.findById(req.params.id)
    .then((course) => {
      renderObject.course = course;
      return Lesson.find({
        course: course._id
      });
    }).then((lessons) => {
      renderObject.lessons = lessons;
      res.status(200)
        .json(renderObject);
    }).catch((err) => {
      res.status(500).send();
    });
});

//Displaying a specific lesson
router.get('/course/lesson/:id', authenticate, validAccess, (req, res) => {
  Lesson.findById(req.params.id)
    .then((lesson) => {
      res.status(200)
        .json(lesson);
    }).catch((err) => {
      res.status(500).send();
    });
});

//Buying a course
router.get('/buy/:id', authenticate, (req, res) => {
  Course.findById(req.params.id)
    .then((course) => {
      if (!course) {
        res.status(400).send();
      }
      if (course.price === 0) {
        Student.findByIdAndUpdate(req.user._id, {
          $push: {
            courses: course._id
          }
        }).then(() => {
          res.status(200)
            .json({
              success: true,
              message: 'Course added to My-Courses'
            });
        }).catch((err) => {
          res.status(400).send();
        });
      } else {
        Cart.findOne({
          student: req.user._id,
          course: req.params.id
        }).then((item) => {
          if (item) {
            res.status(400)
              .json({
                success: false,
                message: 'Item already present in cart'
              });
          } else {
            new Cart({
                student: req.user._id,
                course: req.params.id
              })
              .save()
              .then(() => {
                res.status(200)
                  .json({
                    success: true,
                    message: 'Course added to the cart'
                  });
              }).catch((err) => {
                res.status(400).send();
              });
          }
        }).catch((err) => {
          res.status(400).send();
        });
      }
    }).catch((err) => {
      res.status(400).send();
    });
});

//Listing cart items
router.get('/cart', authenticate, (req, res) => {
  Cart.find({
    student: req.user._id
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
        if (count === len) {
          clearInterval(interval);
          resolve(items);
        }
      }, 5);
    });
  }).then((items) => {
    var total = 0;
    if (items.length > 0) {
      items.forEach((item) => {
        total += item.course.price;
      });
    }
    res.status(200)
      .json({
        success: true,
        items,
        total,
      });
  }).catch((err) => {
    res.status(500).send();
  });
});

//Deleting cart items
router.delete('/cart/:id', authenticate, (req, res) => {
  Cart.findById(req.params.id)
    .then((item) => {
      if (!item) {
        req.status(400)
          .json({
            success: false,
            message: 'Item is not present in your cart'
          });
      } else if (!item.student.equals(req.user._id)) {
        req.status(400)
          .json({
            success: false,
            message: 'Item is not present in your cart'
          });
      } else {
        Cart.findByIdAndRemove(req.params.id)
          .then(() => {
            res.status(200)
              .json({
                success: true,
                message: 'Item removed from cart'
              });
          }).catch((err) => {
            res.status(500).send();
          });
      }
    }).catch((err) => {
      res.status(500).send();
    });
});

//Not found
router.get('/*', authenticate, (req, res) => {
  res.status(400)
  .json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = router;
