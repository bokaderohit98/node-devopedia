//Loading models
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const Course = require('../models/Course');
const CourseRequest = require('../models/CourseRequest');
const Message = require('../models/Message');
const EditRequest = require('../models/EditRequest');

//Loading dependencies
const express = require('express');
const router = express.Router();
const transporter = require('../config/nodemailer');
const validate = require('../helpers/validate');
const authenticate = require('../helpers/auth').isAdmin; //middleware to authenticate request
const adminAuth = require('../config/passport').adminAuth; //middlelware to login

//Admin login form
router.get('/', (req, res) => {
  var action = '/admin';
  res.render('body/general/authenticate', {
    action,
    isAdmin: true
  });
});

//Handling admin login
router.post('/login', adminAuth);

//Admin Dashboard
router.get('/dashboard', authenticate, (req, res) => {
  res.render('body/admin/home', {
    layout: 'dashboard',
    header: 'Dashboard'
  });
});


//Handling Students

//Listing all students
router.get('/students', authenticate, (req, res) => {
  Student.find({})
    .then((students) => {
      students.forEach((student) => {
        student.count = student.courses.length;
      });
      res.render('body/admin/students', {
        layout: 'dashboard',
        students,
        header: 'Students'
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error Occured');
      res.redirect('/admin/dashboard');
    });
})

//Deleting a student
router.delete('/students/:id', authenticate, (req, res) => {
  Student.findByIdAndRemove(req.params.id)
    .then((student) => {
      transporter.sendMail({
        from: `Team Devopedia <${process.env.EMAIL}>`,
        to: student.email,
        subject: 'Your Acoount is Deleted',
        template: 'accountDeleted',
        context: {
          host: process.env.HOST,
          name: student.name,
        }
      }, (err, response) => {
        if (err) {
          console.log(err);
          req.flash('error_msg', 'Some internal error occured. Please try again later');
        } else {
          req.flash('success_msg', `Successfully removed ${student.name}`);
          res.redirect('/admin/students');
        }
        res.redirect('/admin/students');
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error Occured');
      res.redirect('/admin/students');
    });
});

//Handling Mentors
//Listing all mentors
router.get('/mentors', authenticate, (req, res) => {
  Mentor.find({})
    .then((mentors) => {
      res.render('body/admin/mentors', {
        layout: 'dashboard',
        mentors,
        header: 'Mentors'
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error occured');
      res.redirect('/admin/mentors');
    });
})

//Deleting a mentor
router.delete('/mentors/:id', authenticate, (req, res) => {
  Mentor.findByIdAndRemove(req.params.id)
    .then((mentor) => {
      transporter.sendMail({
        from: `Team Devopedia <${process.env.EMAIL}>`,
        to: mentor.email,
        subject: 'Your Acoount is Deleted',
        template: 'accountDeleted',
        context: {
          host: process.env.HOST,
          name: mentor.name,
        }
      }, (err, response) => {
        if (err) {
          console.log(err);
          req.flash('error_msg', 'Some internal error occured. Please try again later');
        } else {
          req.flash('success_msg', `Successfully removed ${mentor.name}`);
          res.redirect('/admin/mentors');
        }
        res.redirect('/admin/mentors');
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error occured');
      res.redirect('/admin/mentors');
    });
});

//Handling messages
//Listing messages
router.get('/messages', authenticate, (req, res) => {
  Message.find({})
    .then((messages) => {
      res.render('body/admin/messages', {
        layout: 'dashboard',
        messages,
        header: 'Messages',
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error Occured');
      res.redirect('/admin/dashboard');
    });
});

//Deleting messages
router.delete('/messages/:id', authenticate, (req, res) => {
  Message.findByIdAndRemove(req.params.id)
    .then((message) => {
      req.flash('success_msg', 'Message deleted');
      res.redirect('/admin/messages');
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error Occured');
      res.redirect('/admin/messages');
    });
});


//Mailing
//Form to reply a messages
router.get('/reply/:email', authenticate, (req, res) => {
  res.render('body/admin/reply', {
    layout: 'dashboard',
    email: req.params.email,
    header: 'Interact'
  });
});

//message post request
router.post('/reply', authenticate, (req, res) => {
  var email = req.body.email;
  var {
    errors,
    newMessage
  } = validate.reply(req);
  if (errors) {
    res.render('body/admin/reply', {
      layout: 'dashboard',
      errors,
      email: req.params.email,
      newMessage,
      header: 'Interact',
    });
  } else {
    transporter.sendMail({
      from: `Team Devopedia <${process.env.EMAIL}>`,
      to: email,
      subject: newMessage.subject,
      template: 'reply',
      context: {
        host: process.env.HOST,
        newMessage
      }
    }, (err, response) => {
      if (err) {
        console.log(err);
        req.flash('error_msg', 'Some internal error occured. Please try again later');
      } else {
        req.flash('success_msg', `mail sent to ${email}`);
        res.redirect('/admin/dashboard');
      }
      res.redirect('/admin/dashboard');
    });
  }
});

//Handling course requests
//Displaying all requests
router.get('/course-request', authenticate, (req, res) => {
  courseRequests = {};
  CourseRequest.find({
    approved: true
  }).then((approvedCourseRequests) => {
    courseRequests.approvedCourseRequests = approvedCourseRequests;
    return CourseRequest.find({
      approved: false
    });
  }).then((unapprovedCourseRequests) => {
    courseRequests.unapprovedCourseRequests = unapprovedCourseRequests;
    res.render('body/general/courseRequests', {
      layout: 'dashboard',
      approvedCourseRequests: courseRequests.approvedCourseRequests,
      unapprovedCourseRequests: courseRequests.unapprovedCourseRequests,
      header: 'Requested Courses'
    });
  }).catch((err) => {
    req.flash('error_msg', 'Some internal error occured');
    res.redirect('/admin/dashboard');
  });
});

//Approving requests
router.get('/course-request/approve/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var request;
  CourseRequest.findByIdAndUpdate(id, {
    approved: true,
  }).then((courseRequest) => {
    request = courseRequest;
    return Student.findById(courseRequest.author);
  }).then((student) => {
    transporter.sendMail({
      from: `Team Devopedia <${process.env.EMAIL}>`,
      to: student.email,
      subject: 'Course Request Approved',
      template: 'courseRequest',
      context: {
        host: process.env.HOST,
        request,
        student,
        accepted: true,
      }
    }, (err, response) => {
      if (err) {
        console.log(err);
        req.flash('error_msg', 'Some internal error occured. Please try again later');
      } else {
        req.flash('success_msg', `Course request has been approved and sent to mentors`);
        res.redirect('/admin/course-request');
      }
      res.redirect('/admin/course-request');
    });
  }).catch((err) => {
    console.log(err);
    req.flash('error_msg', 'Some internal error occured');
    res.rediret('/admin/course-request');
  })
});

//Deleting course Requests
router.delete('/course-request/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var request;
  CourseRequest.findById(id)
    .then((courseRequest) => {
      request = courseRequest;
      if (!courseRequest.approved) {
        return Student.findById(courseRequest.author)
      }
    }).then((student) => {
      if (!student) {
        return;
      }
      transporter.sendMail({
        from: `Team Devopedia <${process.env.EMAIL}>`,
        to: student.email,
        subject: 'Course Request Rejected',
        template: 'courseRequest',
        context: {
          host: process.env.HOST,
          request,
          student,
          accepted: false,
        }
      });
    }).then((err, response) => {
      return CourseRequest.findByIdAndRemove(id);
    }).then(() => {
      req.flash('success_msg', 'Course Request Deleted');
      res.redirect('/admin/course-request');
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error occured');
      res.redirect('/admin/course-request');
    });
});

//Handling edit Requests
//Displaying edit Requests
router.get('/edit-request', authenticate, (req, res) => {
  EditRequest.find({})
    .then((editRequests) => {
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
        header: 'Edit Requests'
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error occured');
      res.redirect('/admin/dashboard');
    });
});

//Approving edit request
router.get('/edit-request/approve/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var request;
  EditRequest.findById(id)
    .then((editRequest) => {
      console.log(editRequest);
      return Course.findByIdAndUpdate(editRequest.course, {
        approved: false
      });
    }).then((course) => {
      request = course;
      return Mentor.findById(course.author);
    }).then((mentor) => {
      transporter.sendMail({
        from: `Team Devopedia <${process.env.EMAIL}>`,
        to: mentor.email,
        subject: 'Edit Request Accepted',
        template: 'editRequest',
        context: {
          host: process.env.HOST,
          request,
          mentor,
          accepted: true,
        }
      });
    }).then(() => {
      return EditRequest.findByIdAndRemove(id);
    }).then(() => {
      req.flash('success_msg', 'Edit request approved.');
      res.redirect('/admin/edit-request');
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error occured');
      res.redirect('/admin/edit-request');
    });
});

//Rejecting edit request
router.get('/edit-request/reject/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var request;
  EditRequest.findById(id)
    .then((editRequest) => {
      console.log(editRequest);
      return Course.findByIdAndUpdate(editRequest.course, {
        approved: false
      });
    }).then((course) => {
      request = course;
      return Mentor.findById(course.author);
    }).then((mentor) => {
      transporter.sendMail({
        from: `Team Devopedia <${process.env.EMAIL}>`,
        to: mentor.email,
        subject: 'Edit Request Rejected',
        template: 'editRequest',
        context: {
          host: process.env.HOST,
          request,
          mentor,
          accepted: false,
        }
      });
    }).then(() => {
      return EditRequest.findByIdAndRemove(id);
    }).then(() => {
      req.flash('success_msg', 'Edit request rejected.');
      res.redirect('/admin/edit-request');
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error occured');
      res.redirect('/admin/edit-request');
    });
});

//Search
router.post('/search', authenticate, (req, res) => {
  if (req.body.query.length === 0) {
    res.redirect('/admin/dashboard');
  } else {
    var query = {
      $regex: req.body.query,
      $options: 'i'
    };

    var renderObject = {};

    Course.find({
      approved: true,
      title: query,
    }).then((approvedCourses) => {
      renderObject.approvedCourses = approvedCourses;
      return Course.find({
        approved: false,
        title: query
      });
    }).then((unapprovedCourses) => {
      renderObject.unapprovedCourses = unapprovedCourses;
      return Student.find({name: query});
    }).then((students) => {
      renderObject.students = students;
      return Mentor.find({name: query});
    }).then((mentors) => {
      renderObject.mentors = mentors;
      res.render('body/general/search', {
        layout: 'dashboard',
        header: 'Search Results',
        approvedCourses: renderObject.approvedCourses,
        unapprovedCourses: renderObject.unapprovedCourses,
        students: renderObject.students,
        mentors: renderObject.mentors
      });
    }).catch((err) => {
      console.log(err);
      req.flash('error_msg', 'Some internal error occured');
      res.redirect('/admin/dashboard');
    });
  }
});

//Logout
router.get('/logout', authenticate, (req, res) => {
  req.logout();
  req.flash('success_msg', 'You have been logged out');
  res.redirect('/admin');
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


//Exporting Router
module.exports = router;
