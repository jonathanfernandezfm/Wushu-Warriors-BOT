const mongoose = require("mongoose");
const auth = require("../auth.json");

const mongoDB = `mongodb+srv://${auth.db.user}:${auth.db.pass}@wushu-warriors-cluster.myea5.gcp.mongodb.net/WushuWarriorsDB?retryWrites=true&w=majority`;
mongoose
	.connect(mongoDB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then((db) => console.log("DB connected"))
	.catch((err) => console.log(err));

mongoose.set("useCreateIndex", true);
mongoose.Promise = global.Promise;
module.exports = mongoose;
