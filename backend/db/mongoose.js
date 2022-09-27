// This file will handle connection logic to MongoDB database
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/symblAnalysis', { useNewUrlParser: true }).then(() => {
    console.log('Connected to MongoDB successfully!');
}).catch((e) => {
    console.log('Error while attempting to connect to MongoDB!');
    console.log(e);
});

// To prevent deprecation warnings (from MongoDB native driver)
module.exports = {
    mongoose
};