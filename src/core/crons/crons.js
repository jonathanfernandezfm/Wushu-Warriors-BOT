const embeds = require("../../../embeds");
const Cron = require("../../controllers/cron");

module.exports = {
	createCron: (msg) => {
		// FORMAT  0 45 19 * * MON,TUE,WED,THU,SUN *
		msg.delete();
		const values = msg.content.replace("dev!createCron ", "").split(" ");

		if (values.length !== 9) {
			embeds.createErrorEmbed(msg.channel, "❌ Error en los parametros.");
		}

		const cron_string = `${values[0]} ${values[1]} ${values[2]} ${values[3]} ${values[4]} ${values[5]} ${values[6]}`;
		const type = values[7];
		const channel = values[8];

		Cron.add(cron_string, channel, type);
	},
};
