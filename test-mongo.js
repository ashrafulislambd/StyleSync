const mongoose = require('mongoose');

console.log('Testing connection to mongodb://127.0.0.1:27017/styleSync...');
mongoose.connect('mongodb://127.0.0.1:27017/styleSync', { serverSelectionTimeoutMS: 2000 })
    .then(() => {
        console.log('SUCCESS');
        process.exit(0);
    })
    .catch((err) => {
        console.error('FAILED', err.message);
        process.exit(1);
    });
