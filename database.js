const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/wushu-warriors', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
	console.log("Database conected");
});

db.Promise = global.Promise;
module.exports = db;