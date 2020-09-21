const cron = require("../models/cron");
const cronModel = require("../models/cron");

module.exports = {
	add: (time, channel, type) => {
		cronModel
			.create({ time: time, channel: channel, type: type, active: true })
			.then((value) => console.log("Cron created -> " + value))
			.catch((err) => console.log("Error when creating cron -> " + err));
	},
	list: () => {
		return cronModel
			.find({})
			.then((value) => {
				return value;
			})
			.catch((err) => console.log("Error list crons -> " + err));
	},
	delete: (id) => {
		cronModel
			.deleteOne({ _id: id })
			.then((value) => console.log("Cron deleted -> " + value.toString()))
			.catch((err) => console.log("Error delete cron -> " + err));
	},
	changeActive: (active) => {
		cronModel
			.updateOne({ _id: id }, { active: active })
			.then((value) => console.log("Cron updated -> " + value.toString()))
			.catch((err) => console.log("Error delete cron -> " + err));
	},
};
