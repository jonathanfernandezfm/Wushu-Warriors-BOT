const embeds = require("../../../embeds");

module.exports = {
	bet: (msg) => {
		const first_parameter = msg.content.split(" ")[1];
		const second_parameter = msg.content.split(" ")[2];
		let user_tagged;
		let amount;
		let user_that_reacted;

		msg.delete();

		msg.mentions.users.forEach((u) => {
			user_tagged = u;
		});

		if (user_tagged && msg.author.id === user_tagged.id) {
			embeds.createErrorEmbed(msg.channel, "❌ No puedes apostar contigo mismo");
			return;
		}

		if (!first_parameter) {
			embeds.createErrorEmbed(
				msg.channel,
				"❌ Error en el comando.",
				"Uso: w!bet @usuario 100"
			);
			return;
		}

		if (!second_parameter) {
			amount = parseInt(first_parameter);
			user_tagged = undefined;
		} else if (second_parameter) {
			amount = parseInt(second_parameter);
		} else {
			embeds.createErrorEmbed(
				msg.channel,
				"❌ Error en el comando",
				"Uso: w!bet @usuario 100"
			);
			return;
		}

		if (!amount) {
			embeds.createErrorEmbed(msg.channel, "❌ Cantidad errónea", "Uso: w!bet @usuario 100");
			return;
		}

		const filter = (reaction, reaction_user) => {
			if (user_tagged) {
				return (
					(reaction.emoji.name === "☝️" &&
						msg.author.id !== reaction_user.id &&
						user_tagged.id === reaction_user.id) ||
					(reaction.emoji.name === "❌" && msg.author.id === reaction_user.id)
				);
			} else {
				user_that_reacted = reaction_user;
				return (
					(reaction.emoji.name === "☝️" && msg.author.id !== reaction_user.id) ||
					(reaction.emoji.name === "❌" && msg.author.id === reaction_user.id)
				);
			}
		};

		const embed = embeds.createApuestaEmbed();

		if (user_tagged) {
			embed.addFields(
				{ name: "Autor:", value: msg.author, inline: true },
				{ name: "Cantidad a apostar:", value: amount + " 🟡", inline: true },
				{ name: "Oponente:", value: user_tagged }
			);
		} else {
			embed.addFields(
				{ name: "Autor:", value: msg.author, inline: true },
				{ name: "Cantidad a apostar:", value: amount + " 🟡", inline: true }
			);
		}

		msg.channel
			.send(embed)
			.then(async (msg_sended) => {
				await msg_sended.react("☝️");
				await msg_sended.react("❌");

				msg_sended
					.awaitReactions(filter, { max: 1, time: 20000, errors: ["time"] })
					.then((collection) => {
						collection.map((message_reaction) => {
							if (user_that_reacted) user_tagged = user_that_reacted;

							if (message_reaction.emoji.name === "☝️") {
								const embed_rolling = embeds.createEmbedRolling(
									msg,
									user_tagged,
									amount
								);

								let author_roll = Math.floor(Math.random() * 6) + 1;
								let oponent_roll = Math.floor(Math.random() * 6) + 1;
								let winner;
								if (author_roll > oponent_roll) winner = msg.author;
								else if (oponent_roll > author_roll) winner = user_tagged;
								else winner = undefined;

								const embed_final = embeds.createEmbedFinal(
									msg,
									user_tagged,
									amount,
									author_roll,
									oponent_roll
								);

								if (winner) {
									embed_final.addFields(
										{ name: "Ganador:", value: `${winner}`, inline: true },
										{ name: "Ganado:", value: amount * 2 + " 🟡", inline: true }
									);
								} else {
									embed_final.addFields({
										name: "Ganador:",
										value: "Empate",
										inline: true,
									});
								}

								msg_sended
									.edit(embed_rolling)
									.then((rolling_msg) => {
										setTimeout(() => rolling_msg.edit(embed_final), 2000);
									})
									.catch((err) => {
										console.warn("Error creating embed rolling", err);
									});
							}

							if (message_reaction.emoji.name === "❌") {
								embeds.editErrorEmbed(msg_sended, "❌ Apuesta cancelada");
							}
						});
					})
					.catch((err) => {
						console.warn("timed out gambling", err);
						msg_sended.delete();
					});
			})
			.catch((err) => {
				console.warn("Error in embed bet", err);
			});
	},
};
