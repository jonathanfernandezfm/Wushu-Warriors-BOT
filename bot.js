const Discord = require("discord.js");
const cron = require("node-cron");
const auth = require("./auth.json");
const embeds = require("./embeds.js");
const tickets = require("./app/src/tickets/tickets");
const developer = require("./app/src/developer/developer");
const surveys = require("./app/src/surveys/surveys");
const gambling = require("./app/src/gambling/gambling");
const constants = require("./constants");
const mongoose = require("./config/database");

mongoose.connection.on("error", console.error.bind(console, "Error connecting to MongoDB"));
const bot = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });
const Collector = require("./app/src/controllers/collector");

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
	cron.schedule("0 45 21 * * MON,TUE,WED,THU,SUN *", () => {
		const channel = bot.channels.cache.get(constants.GENERAL_CHANNEL);
		channel.send("@here");
		channel.send(embeds.createRaidCronEmbed());
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

	if (msg.content.includes("dev!test"))
		if (msg.member._roles.find((role) => role === constants.ROLE_DEVELOPER)) {
			bot.channels.cache
				.get(constants.BIENVENIDA_CHANNEL)
				.send(
					`**Pepe** acaba de unirse al servidor. Bievenido! Echale un vistazo a tus mensajes privados 👀`
				);
			msg.author
				.createDM()
				.then((channel) => {
					console.log(channel);
					channel.send(embeds.createSucessEmbed(channel, "Bievenido!!"));
				})
				.catch((err) => {
					console.warn(err);
				});
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
