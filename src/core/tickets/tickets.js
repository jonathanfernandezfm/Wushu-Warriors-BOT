const embeds = require("../../../embeds");
const constants = require("../../../constants");
const tickets = require("./tickets");
const Collector = require("../../controllers/collector");

module.exports = {
	createTicketCollector: (ticket_embed_message) => {
		const filter = (reaction, user) => {
			return true;
		};

		const collector = ticket_embed_message.createReactionCollector(filter, {});

		collector.on("collect", (reaction, user) => {
			setTimeout(() => {
				reaction.users.remove(user.id);
			}, 2000);

			if (reaction.emoji.name === "✉️") {
				ticket_embed_message.guild.channels
					.create("ticket-" + user.username, {
						type: "text",
						parent: constants.SUGERENCIAS_CATEGORY,
						permissionOverwrites: [
							{ id: ticket_embed_message.guild.id, deny: ["VIEW_CHANNEL"] },
							{ id: user.id, allow: ["VIEW_CHANNEL"] },
						],
						position: 40,
						reason: "New ticket channel",
					})
					.then((channel) => {
						channel.send(
							user.toString() +
								" escribe aqui tu sugerencia/problema. Recuerda que es un unico mensaje el que puedes enviar.\nEste canal será eliminado tras 5 minutos de inactividad"
						);

						const filter2 = (ticket_message) => {
							return user.id === ticket_message.author.id;
						};

						channel
							.awaitMessages(filter2, { max: 1 })
							.then((messages) => {
								let ticket_message;

								messages.forEach((m) => {
									ticket_message = m;
								});

								if (ticket_message) {
									const sug_channel = ticket_embed_message.guild.channels.resolve(
										constants.SUGERENCIAS_CHANNEL
									);
									sug_channel.send(
										embeds.createTicketSentEmbed(
											ticket_message.author,
											ticket_message
										)
									);
									channel.delete();
								}
							})
							.catch((err) => {
								console.warn(err);
							});

						setTimeout(() => {
							channel.delete();
						}, 300000);
					})
					.catch((err) => {
						console.warn("Error creating ticket channel", err);
					});
			}
		});

		collector.on("end", (collected) => {
			console.log(`Collected ${collected.size} items`);
		});
	},
	createTicketEmbed: (msg) => {
		msg.delete();
		msg.channel
			.send(embeds.createTicketEmbed())
			.then((ticket_embed_message) => {
				ticket_embed_message
					.react("✉️")
					.then((react) => {
						Collector.add(
							ticket_embed_message.id,
							ticket_embed_message.channel.id,
							"ticket"
						);
						tickets.createTicketCollector(ticket_embed_message);
					})
					.catch((err) => {
						console.warn("Error reacting", err);
					});
			})
			.catch((err) => {
				console.warn("Error creating ticket embed", err);
			});
	},
};
