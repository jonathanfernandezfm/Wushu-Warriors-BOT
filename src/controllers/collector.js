const collectorModel = require("../models/collector");

module.exports = {
	add: (messageId, channelId, type) => {
		collectorModel
			.create({ messageId: messageId, channelId: channelId, type: type })
			.then((value) => console.log("Collector created -> " + value))
			.catch((err) => console.log("Error when creating collector -> " + err));
	},
	list: (type) => {
		return collectorModel
			.find({ type: type })
			.then((value) => {
				return value;
			})
			.catch((err) => console.log("Error list collectors -> " + err));
	},
	delete: (id) => {
		collectorModel
			.deleteOne({ _id: id })
			.then((value) => console.log("Collector deleted -> " + value.toString()))
			.catch((err) => console.log("Error delete collector -> " + err));
	},
};
