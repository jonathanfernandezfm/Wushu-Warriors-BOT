const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CronSchema = new Schema({
	time: {
		type: String,
		required: true,
	},
	channel: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	active: {
		type: Boolean,
		required: true,
	},
});

module.exports = mongoose.model("Cron", CronSchema);
