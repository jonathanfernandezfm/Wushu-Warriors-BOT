const Discord = require("discord.js");
const cron = require("node-cron");
const auth = require("./auth.json");
const embeds = require("./embeds.js");
const tickets = require("./app/src/tickets/tickets");
const developer = require("./app/src/developer/developer");
const surveys = require("./app/src/surveys/surveys");
const gambling = require("./app/src/gambling/gambling");
const constants = require("./constants");
const { Datastore } = require("@google-cloud/datastore");

const datastore = new Datastore();
const bot = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });

bot.login(auth.discord.token);

bot.on("ready", async (evt) => {
	console.log("Bot started!");
	// console.log(process.versions);

	// COLLECTORS
	const query = datastore.createQuery("Collector");
	const [collectors] = await datastore.runQuery(query);

	for (const collector of collectors) {
		const collectorKey = collector[datastore.KEY];
		if (collector.type === "ticket") {
			const msg_id = collectorKey.name;

			bot.channels.cache
				.get(collector.channel)
				.messages.fetch(msg_id)
				.then((msg) => {
					tickets.createTicketCollector(msg);
					console.log("Ticket collector created");
				})
				.catch((err) => {
					console.warn("Ticket collector error", err);
				});
		}
	}

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
			developer.createTicketEmbed(msg);

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
