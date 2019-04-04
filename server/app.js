const exhbs = require('express-handlebars');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const passport = require('passport');

//Loading dependencies
require('./config/config');
//const passport = require('./config/passport').passport;
const transporter = require('./config/nodemailer');

//Loading Message Model
const Message = require('./models/Message');

//Initializing app
const app = express();

const validate = require('./helpers/validate');

//Setting middlewares
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));
//app.use(passport.initialize());
//app.use(passport.session());
app.use(express.static(path.join(__dirname, '../public')));
app.engine('handlebars', exhbs({
  defaultLayout: 'general'
}));
app.set('view engine', 'handlebars');

//Middleware to set globalvariable
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.info_msg = req.flash('info_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//Connecting to database
require('./config/mongoose');

//Connecting routes
const admin = require('./routes/admin');
const mentor = require('./routes/mentor');
const student = require('./routes/student');
const course = require('./routes/course');
const apiStudent = require('./routes/api/routes/student');
app.use('/admin', admin);
app.use('/student', student);
app.use('/mentor', mentor);
app.use('/course', course);
app.use('/api/student', apiStudent);


//Home route: Motive
app.get('/', (req, res) => {
  res.render('body/general/home');
});

//Handling contact queries
app.post('/contact', (req, res) => {
  var {
    errors,
    newMessage
  } = validate.contact(req);
  if (errors) {
    res.render('body/general/home', {
      errors,
      newMessage
    });
  } else {
    new Message(newMessage)
    .save()
    .then(() => {
      req.flash('success_msg', 'Message submitted successfully! We will reach to you soon');
      res.redirect('/#contact');
    });
  }
});

//Error 404
app.get('*', (req, res) => {
  res.render('body/general/error404', {
    layout: 'general'
  });
});

//Setting up port
const port = process.env.PORT;

//Starting server
app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Server running on port ${port}`);
});
