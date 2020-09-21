const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CollectorSchema = new Schema({
	messageId: {
		type: String,
		required: true,
	},
	channelId: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Collector", CollectorSchema);
