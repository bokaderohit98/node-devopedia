const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const TempStudent = require('../models/tempModels/TempStudent');
const TempMentor = require('../models/tempModels/TempMentor');

const transporter = require('../config/nodemailer');
const randomString = require('randomstring');

module.exports = {

  sendVerificationMail: (req, res, user, Model) => {
    var TempModel;
    var redirect;
    if (Model === Student) {
      TempModel = TempStudent;
      redirect = '/student';
    } else {
      TempModel = TempMentor;
      redirect = '/mentor';
    }

    var verificationUrl = randomString.generate(40);
    user.verificationUrl = verificationUrl;

    Model.findOne({
        email: user.email
      })
      .then((persistentUser) => {
        if (persistentUser) {
          req.flash('info_msg', ' User already registered. Login to continue');
          res.redirect(redirect);
        } else {
          TempModel.findOne({
              email: user.email
            })
            .then((tempUser) => {
              if (tempUser) {
                req.flash('info_msg', ' Already registered. Please confirm email to complete registration process');
                res.redirect(redirect);
              } else {
                new TempModel(user)
                  .save()
                  .then(() => {
                    transporter.sendMail({
                      from: `Team Devopedia <${process.env.EMAIL}>`,
                      to: user.email,
                      subject: 'Verify Email',
                      template: 'confirmEmail',
                      context: {
                        host: process.env.HOST,
                        route: redirect,
                        user
                      }
                    }, (err, response) => {
                      if (err) {
                        console.log(err);
                        req.flash('error_msg', 'Some internal error occured. Please try again later');
                      } else {
                        req.flash('success_msg', 'Confirmation email sent to your email address. Please confirm your email to finish registration process!');
                      }
                      res.redirect(redirect);
                    });
                  })
              }
            })
        }
      }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Some internal error occured. Please try again later');
        res.redirect(redirect);
      });
  },

  confirmEmail: (req, res, verificationUrl, Model) => {
    var TempModel;
    var route;
    if (Model === Student) {
      TempModel = TempStudent;
      redirect = '/student';
    } else {
      TempModel = TempMentor;
      redirect = '/mentor';
    }

    TempModel.findOne({
        verificationUrl
      })
      .then((user) => {
        delete user.verificationUrl;
        delete user._id;
        var newUser = {
          name: user.name,
          email: user.email,
          password: user.password,
        };
        new Model(newUser)
          .save()
          .then(() => {
            TempModel.findByIdAndRemove(user._id)
              .then((user) => {
                transporter.sendMail({
                  from: `Team Devopedia <${process.env.EMAIL}>`,
                  to: user.email,
                  subject: 'Successfully Registered',
                  template: 'successfulRegistration',
                  context: {
                    host: process.env.HOST,
                    route: redirect,
                    user
                  }
                }, (err, response) => {
                  if (err) {
                    console.log(err);
                    req.flash('error_msg', 'Some internal error occured. Please try again later');
                  } else {
                    req.flash('success_msg', 'Yipee! You have successfully registered to devopedia. Wish you a great time ahead');
                  }
                  res.redirect(redirect);
                });
              }).catch((err) => {
                console.log(err);
                req.flash('error_msg', 'Some internal error occured. Please try again later');
                res.redirect(redirect);
              });
          }).catch((err) => {
            console.log(err);
            req.flash('error_msg', 'Some internal error occured. Please try again later');
            res.redirect(redirect);
          });
      }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Looks like someone tempered with the verification url.');
        res.redirect(redirect);
      });
  },

}
