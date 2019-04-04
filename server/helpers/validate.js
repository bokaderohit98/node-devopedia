const validUrl = require('valid-url');

module.exports.login = (req) => {
  var errors = [];

  if (req.body.email.length < 10) {
    errors.push({
      text: 'Email is required'
    });
  }
  if (req.body.password.length < 5) {
    errors.push({
      text: 'Password too short'
    });
  }
  if (errors.length > 0) {
    return errors;
  } else {
    return null;
  }
};

module.exports.register = (req) => {
  var errors = [];

  if (req.body.name.length < 3) {
    errors.push({
      text: 'Name too short'
    });
  }
  if (req.body.email.length < 10) {
    errors.push({
      text: 'Email is required'
    });
  }
  if (req.body.password.length < 5) {
    errors.push({
      text: 'Password too short'
    });
  }
  var newUser = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  };
  if (errors.length > 0) {
    return {
      errors,
      newUser
    };
  } else {
    return {
      errors: null,
      newUser
    };
  }
};

module.exports.contact = (req) => {
  var errors = [];

  if (req.body.name.length < 3) {
    errors.push({
      text: 'Name too short'
    });
  }
  if (!req.body.email) {
    errors.push({
      text: 'Email is required'
    });
  }
  if (req.body.message.length < 15) {
    errors.push({
      text: "That ain't a good message"
    });
  }
  var newMessage = {
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
  };
  if (errors.length > 0) {
    return {
      errors,
      newMessage
    };
  } else {
    return {
      errors: null,
      newMessage
    };
  }
};

module.exports.courseRequest = (req) => {
  var errors = [];

  if (req.body.title.length < 4) {
    errors.push({
      text: 'Title too short'
    });
  }
  if (req.body.description.length === 0) {
    errors.push({
      text: 'Please provide a bettter description'
    });
  }
  var newCourseRequest = {
    title: req.body.title,
    description: req.body.description
  };
  if (errors.length > 0) {
    return {
      errors,
      newCourseRequest
    };
  } else {
    return {
      errors: null,
      newCourseRequest
    };
  }
};

module.exports.course = (req) => {
  var errors = [];

  if (req.body.title.length < 4) {
    errors.push({
      text: 'Title too short'
    });
  }
  if (req.body.introduction.length < 20) {
    errors.push({
      text: 'Please provide a bettter description'
    });
  }
  if (!validUrl.isUri(req.body.video)) {
    errors.push({
      text: 'Video url is not valid'
    });
  }
  if (!validUrl.isUri(req.body.img)) {
    errors.push({
      text: 'Image url is not valid'
    });
  }
  if (req.body.price < 0) {
    errors.push({
      text: 'Do you even know what a price is'
    });
  }
  var newCourse = {
    title: req.body.title,
    introduction: req.body.introduction,
    video: req.body.video,
    img: req.body.img,
    price: req.body.price
  };
  newCourse._id = req.params.id;
  if (errors.length > 0) {
    return {
      errors,
      newCourse
    };
  } else {
    return {
      errors: null,
      newCourse
    };
  }
};

module.exports.lesson = (req) => {
  var errors = [];

  if (req.body.title.length < 4) {
    errors.push({
      text: 'Title too short'
    });
  }
  if (req.body.description.length < 20) {
    errors.push({
      text: 'Please provide a bettter description'
    });
  }
  if (!validUrl.isUri(req.body.video)) {
    errors.push({
      text: 'Video url is not valid'
    });
  }
  if (!validUrl.isUri(req.body.img)) {
    errors.push({
      text: 'Image url is not valid'
    });
  }

  if (req.body.resource) {
    if(!validUrl.isUri(req.body.resource)) {
      errors.push({
        text: 'Resource url is not valid'
      });
    }
  }

  var newLesson = {
    title: req.body.title,
    description: req.body.description,
    video: req.body.video,
    img: req.body.img,
    course: req.body.course,
    resource: req.body.resource,
  };

  if (errors.length > 0) {
    return {
      errors,
      newLesson
    };
  } else {
    return {
      errors: null,
      newLesson
    };
  }
};

module.exports.reply = (req) => {
  var errors = [];

  if (req.body.subject.length < 4) {
    errors.push({
      text: 'Subject too short'
    });
  }
  if (req.body.message.length < 10) {
    errors.push({
      text: "That ain't a good message"
    });
  }
  var newMessage = {
    subject: req.body.subject,
    message: req.body.message,
  };
  if (errors.length > 0) {
    return {
      errors,
      newMessage
    };
  } else {
    return {
      errors: null,
      newMessage
    };
  }
};

module.exports.profile = (req) => {
  var errors = [];

  if (req.body.name.length === 0) {
    errors.push({
      text: 'Name is Require',
    });
  }
  if (!validUrl.isUri(req.body.img)) {
    req.body.img = '/img/mentor/profile-pic-holder.jpg'
  }

  var newProfile = {
    name: req.body.name,
    info: req.body.info,
    img: req.body.img
  };

  if (errors.length > 0) {
    return {
      errors,
      newProfile
    };
  } else {
    return {
      errors: null,
      newProfile
    };
  }
};

module.exports.editRequest = (req) => {
  var errors = [];

  if (req.body.description.length < 20) {
    errors.push({
      text: "That ain't a good description"
    });
  }

  var newEditRequest = {
    course: req.params.id,
    description: req.body.description
  };

  if (errors.length > 0) {
    return {
      errors,
      newEditRequest
    };
  } else {
    return{
      errors: null,
      newEditRequest
    };
  }
};
