const Discord = require("discord.js");
const cron = require("node-cron");
const auth = require("./auth.json");
const embeds = require("./embeds.js");
const tickets = require("./src/core/tickets/tickets");
const developer = require("./src/core/developer/developer");
const surveys = require("./src/core/surveys/surveys");
const gambling = require("./src/core/gambling/gambling");
const crons = require("./src/core/crons/crons");
const constants = require("./constants");
const mongoose = require("./config/database");

mongoose.connection.on("error", console.error.bind(console, "Error connecting to MongoDB"));
const bot = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });
const Collector = require("./src/controllers/collector");
const Cron = require("./src/controllers/cron");

bot.login(auth.discord.token);

bot.on("ready", async (evt) => {
	console.log("Bot started!");

	// COLLECTORS
	Collector.list("ticket").then((values) => {
		values.forEach((collector) => {
			if (collector.type === "ticket") {
				const messageId = collector.messageId;

				bot.channels.cache
					.get(collector.channelId)
					.messages.fetch(messageId)
					.then((msg) => {
						tickets.createTicketCollector(msg);
						console.log("Ticket collector created");
					})
					.catch((err) => {
						console.error("Ticket collector error", err);
						if (err.message === "Unknown Message") {
							Collector.delete(collector.id);
						}
					});
			}
		});
	});

	// CRONS
	Cron.list().then((values) => {
		values.forEach((_cron) => {
			switch (_cron.type) {
				case "raid":
					if (_cron.active) {
						cron.schedule(_cron.time, () => {
							_cron.channel.send("@here");
							_cron.channel.send(embeds.createRaidCronEmbed());
						});
						console.log("Raid cron created");
					}
					break;
				default:
					console.log("Cron type does not exist");
			}
		});
	});
});

bot.on("message", (msg) => {
	if (msg.content.includes("w!bet")) gambling.bet(msg);

	//////////////////////////////////////////////

	if (msg.content.includes("w!multiEncuesta") || msg.content.includes("w!encuesta"))
		surveys.createEncuesta(msg);

	//////////////////////////////////////////////

	if (msg.content.includes("dev!updateRoles"))
		if (msg.member._roles.find((role) => role === constants.ROLE_DEVELOPER))
			developer.updateRoles(msg);

	//////////////////////////////////////////////

	if (msg.content.includes("dev!addOficialRole"))
		if (msg.member._roles.find((role) => role === constants.ROLE_DEVELOPER))
			developer.addOficialRole(msg);

	//////////////////////////////////////////////

	if (msg.content.includes("dev!removeOficialRole"))
		if (msg.member._roles.find((role) => role === constants.ROLE_DEVELOPER))
			developer.removeOficialRole(msg);

	//////////////////////////////////////////////

	if (msg.content.includes("dev!createTicketEmbed"))
		if (msg.member._roles.find((role) => role === constants.ROLE_DEVELOPER))
			tickets.createTicketEmbed(msg);

	//////////////////////////////////////////////

	if (msg.content.includes("dev!createCron"))
		if (msg.member._roles.find((role) => role === constants.ROLE_DEVELOPER))
			crons.createCron(msg);

	//////////////////////////////////////////////

	if (msg.content.includes("dev!test"))
		if (msg.member._roles.find((role) => role === constants.ROLE_DEVELOPER)) {
			msg.channel.send("test");
		}

	/////////////////////////////////////////////
});

bot.on("guildMemberAdd", (member) => {
	bot.channels.cache
		.get(constants.BIENVENIDA_CHANNEL)
		.send(
			`🎉 **${member.displayName}** acaba de unirse al servidor. Bienvenido! Echale un vistazo a tus mensajes privados 👀`
		);
});

bot.on("guildMemberRemove", (member) => {
	bot.channels.cache
		.get(constants.BIENVENIDA_CHANNEL)
		.send(`**${member.displayName}** acaba de abandonar el servidor. Hasta pronto 👋`);
});
