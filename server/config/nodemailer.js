const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

//transporter configuration
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: process.env.ACCESS_TOKEN
  }
});

transporter.use('compile', hbs({
  viewEngine: {
    extname: '.handlebars',
    layoutsDir: 'views/email/',
    defaultLayout: 'template',
    partialsDir: 'views/email/partials/'
  },
  viewPath: 'views/email/body',
  extName: '.handlebars'
}));

//veryfying transporter
transporter.verify((err, success) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Tranporter Connected');
  }
});

module.exports = transporter;
