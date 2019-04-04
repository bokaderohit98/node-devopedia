const mongoose = require('mongoose');

//Setting promise
mongoose.promise = global.promise;

//Extracting mongodb uri
var uri = process.env.MONGODB_URI;

//Connecting to mongoose
mongoose.connect(uri)
  .then(() => {
    console.log('Connected to Database');
  }).catch((err) => {
    console.log(err);
  });

//Exporting mongoose
module.exports = mongoose;
