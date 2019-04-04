///Loading dependencies
const express = require('express');
const router = express.Router();
const validate = require('../helpers/validate');
const auth = require('../helpers/auth');
const transporter = require('../config/nodemailer');

//Loading Models
const Course = require('../models/Course');
const Mentor = require('../models/Mentor');
const Lesson = require('../models/Lesson');
const Student = require('../models/Student');
const Cart = require('../models/Cart');

//Displaying all courses
router.get('/', auth.isUser, (req, res) => {
  if (req.user.isStudent) {
    Course.find({
      approved: true,
      _id: {
        $nin: req.user.courses
      }
    }).then((courses) => {
      res.render('body/general/courses', {
        layout: 'dashboard',
        courses,
        header: 'All Courses',
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error Occured');
      res.redirect('/admin/student');
    });
  } else {
    Course.find({
      approved: true
    }).then((courses) => {
      res.render('body/general/courses', {
        layout: 'dashboard',
        courses,
        header: 'All Courses',
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error Occured');
      if (user.isAdmin) {
        res.redirect('/admin/dashboad');
      } else {
        res.redirect('/mentor/dashboad');
      }
    });
  }
});

//Displaying one course
router.get('/content/:id', auth.isUser, (req, res) => {
  var id = req.params.id;
  var renderObject = {};

  Course.findById(id)
    .then((course) => {
      renderObject.course = course;
      renderObject.editable = !course.approved;

      if (req.user.isAdmin) {
        renderObject.validAccess = true;
      } else if (req.user.isStudent) {
        if (req.user.courses.some((course) => {
            return course.equals(id);
          })) {
          renderObject.validAccess = true;
        }
      } else {
        if (req.user._id.equals(course.author)) {
          renderObject.isAuthor = true;
          renderObject.validAccess = true;
        }
      }
      return Mentor.findById(course.author);
    }).then((author) => {
      renderObject.author = author.name;
      return Lesson.find({
        course: id
      });
    }).then((lessons) => {
      renderObject.lessons = lessons;
      res.render('body/general/course', {
        layout: 'dashboard',
        course: renderObject.course,
        lessons: renderObject.lessons,
        author: renderObject.author,
        isAuthor: renderObject.isAuthor,
        validAccess: renderObject.validAccess,
        editable: renderObject.editable,
        header: renderObject.course.title,
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internla error occured');
      res.redirect('/');
    });
});

//Displaying unapproved courses: only for admin
router.get('/unapproved', auth.isAdmin, (req, res) => {
  Course.find({
    approved: false
  }).then((unapprovedCourses) => {
    res.render('body/admin/unapprovedCourses', {
      layout: 'dashboard',
      courses: unapprovedCourses,
      header: 'Unapproved Courses'
    });
  }).catch((err) => {
    console.log(err);
    req.flash('error_msg', 'Some internal error Occured');
    res.redirect('/admin/dashboad');
  });
});

//Displaying courses of a Student or a mentor
router.get('/my-courses', auth.isStudentOrMentor, (req, res) => {
  if (req.user.isMentor) {
    var courses = {};
    Course.find({
      author: req.user._id,
      approved: true
    }).then((approvedCourses) => {
      courses.approvedCourses = approvedCourses;
      return Course.find({
        author: req.user._id,
        approved: false
      });
    }).then((unapprovedCourses) => {
      courses.unapprovedCourses = unapprovedCourses;
      return courses;
    }).then((courses) => {
      res.render('body/mentor/myCourses', {
        layout: 'dashboard',
        courses,
        header: 'My Courses'
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error Occured');
      res.redirect('/mentor/dashboad');
    })
  } else {
    var courseIds = req.user.courses;
    Course.find({})
      .where('_id').in(courseIds)
      .then((courses) => {
        res.render('body/student/myCourses', {
          layout: 'dashboard',
          courses,
          header: 'My Courses'
        });
      });
  }
});

//Displaying a lesson from a course
router.get('/lesson/:id', auth.isValidUser, (req, res) => {
  var renderObject = {};
  Lesson.findById(req.params.id)
    .then((lesson) => {
      renderObject.lesson = lesson;
      return Course.findById(lesson.course);
    }).then((course) => {
      res.render('body/general/lesson', {
        layout: 'dashboard',
        lesson: renderObject.lesson,
        course,
        isEditable: !course.approved,
        header: renderObject.lesson.title
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error occured');
      res.redirect('/course')
    });
});


//Adding a course
//Rendering form
router.get('/add', auth.isMentor, (req, res) => {
  res.render('body/mentor/addCourse', {
    layout: 'dashboard',
    add: true,
    header: 'Add Course',
  });
});

//Posting request
router.post('/add', auth.isMentor, (req, res) => {
  var {
    errors,
    newCourse
  } = validate.course(req);

  if (errors) {
    res.render('body/mentor/addCourse', {
      layout: 'dashboard',
      add: true,
      errors,
      course: newCourse,
      header: 'Add Course',
    });
  } else {
    newCourse.author = req.user._id;
    if(!newCourse.price)
      newCourse.price = 0;
    new Course(newCourse)
      .save()
      .then((course) => {
        req.flash('success_msg', 'New course submitted successfully. Add Lessons.');
        res.redirect(`/course/lesson/add/${course._id}`);
      }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Some internal error Occured');
        res.redirect('/mentor/dashboard')
      });
  }
});

//Editing a course
//Rendering form
router.get('/edit/:id', auth.isMentor, (req, res) => {
  Course.findById(req.params.id)
    .then((course) => {
      res.render('body/mentor/addCourse', {
        layout: 'dashboard',
        header: 'Edit Course',
        course
      });
    }).catch((err) => {
      req.flash('error_msg', 'Some internal error occured.');
      res.redirect('/course/my-courses');
    });
});

//Posting request
router.put('/edit/:id', auth.isMentor, (req, res) => {
  var {
    errors,
    newCourse
  } = validate.course(req);

  if (errors) {
    res.render('body/mentor/addCourse', {
      layout: 'dashboard',
      errors,
      course: newCourse,
      header: 'Edit Course'
    });
  } else {
    if(!newCourse.price)
      newCourse.price = 0;
    Course.findByIdAndUpdate(req.params.id, newCourse)
      .then((course) => {
        req.flash('success_msg', 'Course edited successfully.');
        res.redirect(`/course/content/${course._id}`);
      }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Some internal error Occured');
        res.redirect('/course/my-courses');
      });
  }
});

//Adding a Lesson
//Rendering add lesson form
router.get('/lesson/add/:id', auth.isOwner, (req, res) => {
  res.render('body/mentor/addLesson', {
    layout: 'dashboard',
    add: true,
    course: req.params.id,
    header: 'Add Lesson',
  });
});

//Handling post request to add a lesson
router.post('/lesson/add', auth.isOwner, (req, res) => {
  var {
    errors,
    newLesson
  } = validate.lesson(req);
  if (errors) {
    res.render('body/mentor/addLesson', {
      layout: 'dashboard',
      errors,
      header: 'Add Lesson',
      add: true,
      course: newLesson.course,
    });
  } else {
    new Lesson(newLesson)
      .save()
      .then((lesson) => {
        req.flash('success_msg', 'Lesson added successfully.');
        res.redirect(`/course/content/${lesson.course}`);
      });
  }
});

//Editing a Lesson
//Rendering form
router.get('/lesson/edit/:id', auth.isLessonOwner, (req, res) => {
  Lesson.findById(req.params.id)
    .then((lesson) => {
      res.render('body/mentor/addLesson', {
        layout: 'dashboard',
        header: 'Edit Lesson',
        lesson,
        course: lesson.course,
      });
    }).catch((err) => {
      req.flash('error_msg', 'Some internal error occured.');
      res.redirect('/course/my-courses');
    });
});

//Handling put request to edit lesson
router.put('/lesson/edit/:id', auth.isLessonOwner, (req, res) => {
  var {
    errors,
    newLesson
  } = validate.lesson(req);
  if (errors) {
    newLesson._id = req.params.id;
    res.render('body/mentor/addLesson', {
      layout: 'dashboard',
      errors,
      lesson: newLesson,
      course: newLesson.course,
      header: 'Edit Lesson'
    });
  } else {
    Lesson.findByIdAndUpdate(req.params.id, newLesson)
      .then((lesson) => {
        req.flash('success_msg', 'Lesson edited successfully.');
        res.redirect(`/course/lesson/${lesson._id}`);
      }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Some internal error Occured');
        res.redirect('/course/my-courses');
      });
  }
});

//Approving a course
router.get('/approve/:id', auth.isAdmin, (req, res) => {
  var request;
  Course.findByIdAndUpdate(req.params.id, {
    approved: true
  }).then((course) => {
    request = course;
    return Mentor.findById(course.author);
  }).then((mentor) => {
    transporter.sendMail({
      from: `Team Devopedia <${process.env.EMAIL}>`,
      to: mentor.email,
      subject: 'Course Approved',
      template: 'courseStatus',
      context: {
        host: process.env.HOST,
        request,
        mentor,
        accepted: true,
      }
    });
  }).then(() => {
    req.flash('success_msg', 'Course Approved');
    res.redirect('/course/unapproved');
  }).catch((err) => {
    console.log(err);
    req.flash('error_msg', 'Some internal error occured.');
    res.redirect('/course/unapproved');
  });
});

//Purchasing a course: only for Student
router.post('/buy', auth.isStudent, (req, res) => {
  var id = req.body.course;
  Course.findById(id)
  .then((course) => {
    if (course.price === 0) {
      Student.findByIdAndUpdate(req.user._id, {
        $push: {
          courses: course._id
        }
      }).then(() => {
        req.flash('success_msg', 'Successfully added course');
        res.redirect(`/course/content/${id}`);
      }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Some internal error occured');
        res.redirect(`/course/content/${id}`);
      });
    } else {
      Cart.find({
        student: req.user._id,
        course: id
      }).then((items) => {
        if (items.length > 0) {
          req.flash('error_msg', 'Item already exist in cart');
          res.redirect(`/student/cart/${req.user._id}`);
        } else {
          new Cart({
            student: req.user._id,
            course: id
          })
          .save()
          .then(() => {
            res.redirect(`/student/cart/${req.user._id}`);
          }).catch((err) => {
            console.log(err);
            req.flash('error_msg', 'Some internal error occured');
            res.redirect(`/course/content/${id}`);
          });
        }
      });
    }
  }).catch((err) => {
    console.log(err);
    req.flash('Some internal error occured');
    res.redirect(`/course/content/${id}`);
  });
});


//Deleting a course: only for admin
router.delete('/:id', auth.isAdmin, (req, res) => {
  var request;
  Course.findByIdAndRemove(req.params.id)
    .then((course) => {
      request = course;
      return Mentor.findById(course.author);
    }).then((mentor) => {
      transporter.sendMail({
        from: `Team Devopedia <${process.env.EMAIL}>`,
        to: mentor.email,
        subject: 'Course Deleted',
        template: 'courseStatus',
        context: {
          host: process.env.HOST,
          request,
          mentor,
          accepted: false,
        }
      });
    }).then(() => {
      req.flash('success_msg', 'Course Deleted');
      res.redirect('/course');
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error occured');
      res.redirect('/course');
    });
});


// Error 404
router.get('*', auth.isUser, (req, res) => {
  if (!req.user) {
    res.redirect('/error');
  } else if (req.user.isAdmin) {
    res.redirect('/admin/error');
  } else if (req.user.isStudent) {
    res.redirect('/student/error');
  } else {
    res.redirect('/mentor/error');
  }
});

//Exporting Router
module.exports = router;
