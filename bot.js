const Discord = require("discord.js");
const cron = require("node-cron");
const auth = require("./auth.json");
const embeds = require("./embeds.js");
const emojiCharacters = require("./emojis.js");
const { Datastore } = require("@google-cloud/datastore");
const { createTicketEmbed } = require("./embeds.js");

const datastore = new Datastore();
const bot = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });

const ROLE_OFICIAL = "751910138092453900";
const ROLE_DEVELOPER = "751910138092453900";
const SUGERENCIAS_CATEGORY = "752661704638333048";
const SUGERENCIAS_CHANNEL = "752659528746532955";

bot.login(auth.discord.token);

bot.on("ready", (evt) => {
	console.log("Bot started!");
	console.log(process.versions);

	cron.schedule("0 45 21 * * MON,TUE,WED,THU,SUN *", () => {});
});

bot.on("message", (msg) => {
	if (msg.content.includes("w!bet")) {
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

								msg_sended.edit(embed_rolling).then((rolling_msg) => {
									setTimeout(() => rolling_msg.edit(embed_final), 2000);
								});
							}

							if (message_reaction.emoji.name === "❌") {
								embeds.editErrorEmbed(msg_sended, "❌ Apuesta cancelada");
							}
						});
					})
					.catch((err) => {
						console.log("timed out gambling", err);
						msg_sended.delete();
					});
			})
			.catch((err) => {});
	}

	//////////////////////////////////////////////

	if (msg.content.includes("w!multiEncuesta") || msg.content.includes("w!encuesta")) {
		let values = msg.content.split("\n");
		let title = values[2];
		let time = parseInt(values[3]);

		values.splice(0, 4);
		msg.delete();

		let param_error;
		let desc_error;
		if (msg.content.includes("w!multiEncuesta")) {
			param_error = "❌ Error en los parametros.";
			desc_error = "Uso:\n w!multiEncuesta\n titulo\n tiempo\n opcion1\nopcion2\n";
		} else {
			param_error = "❌ Error en los parametros.";
			desc_error = "Uso:\n w!encuesta\n titulo\n tiempo\n opcion1\nopcion2\n";
		}
		if (!title) {
			embeds.createErrorEmbed(msg.channel, param_error, desc_error);
			return;
		}

		if (!time) {
			embeds.createErrorEmbed(msg.channel, param_error, desc_error);
			return;
		}

		if (values.length < 1) {
			embeds.createErrorEmbed(msg.channel, param_error, desc_error);
			return;
		}

		let description = "";

		if (msg.mentions.everyone) description += "@everyone ";

		msg.mentions.users.forEach((user) => {
			description += user.toString();
		});

		if (msg.content.includes("w!multiEncuesta"))
			description += "\nReacciona con la/las opción/opciones que desees.";
		else description += "\nReacciona con la opción que desees.";

		const encuestaEmbed = embeds.createEncuestaEmbed(title, description);

		let opciones = "";
		let letra = 97;
		let reactions_array_filter = [];
		let options_relations = {};

		values.forEach((opcion, index) => {
			options_relations[emojiCharacters[String.fromCharCode(letra + index)]] = opcion;
		});

		values.forEach((opcion, index) => {
			if (opcion.length !== 0) {
				reactions_array_filter.push(emojiCharacters[String.fromCharCode(letra + index)]);
				opciones += `${emojiCharacters[String.fromCharCode(letra + index)]} - ${opcion}\n`;
			}
		});

		const filter = (reaction, user) => {
			return reactions_array_filter.includes(reaction.emoji.name);
		};

		encuestaEmbed.addFields({ name: "Opciones", value: opciones });
		msg.channel.send(encuestaEmbed).then(async (embed_sent) => {
			for (let i = 0; i < values.length; i++) {
				if (values[i].length !== 0)
					await embed_sent.react(emojiCharacters[String.fromCharCode(letra + i)]);
			}

			if (msg.content.includes("w!multiEncuesta")) {
				embed_sent
					.awaitReactions(filter, { time: time, errors: ["time"] })
					.then((collected) => {})
					.catch((collected) => {
						const embed_results = embeds.createEncuestaResultsEmbed(title);

						let result_list = "";
						collected.forEach((collect) => {
							result_list += `${collect.emoji.name} - ${
								options_relations[collect.emoji.name]
							} - ${collect.count - 1}\n`;
							delete options_relations[collect.emoji.name];
						});

						Object.keys(options_relations).forEach((key) => {
							result_list += `${key} - ${options_relations[key]} - ${0}\n`;
						});

						let description = "";

						if (msg.mentions.everyone) description += "@everyone ";

						msg.mentions.users.forEach((user) => {
							description += user.toString();
						});

						embed_results.addFields({ name: "Resultados", value: result_list });
						embed_results.setDescription(description);
						embed_sent.edit(embed_results);
						embed_sent.reactions.removeAll();
					});
			} else if (msg.content.includes("w!encuesta")) {
				embed_sent
					.awaitReactions(filter, { time: time, errors: ["time"] })
					.then((collected) => {
						console.log("then" + collected);
					})
					.catch((collected) => {
						const embed_results = embeds.createEncuestaResultsEmbed(title);

						let result_list = "";
						collected.forEach((collect) => {
							result_list += `${collect.emoji.name} - ${
								options_relations[collect.emoji.name]
							} - ${collect.count - 1}\n`;
							delete options_relations[collect.emoji.name];
						});

						Object.keys(options_relations).forEach((key) => {
							result_list += `${key} - ${options_relations[key]} - ${0}\n`;
						});

						let description = "";

						if (msg.mentions.everyone) description += "@everyone ";

						msg.mentions.users.forEach((user) => {
							description += user.toString();
						});

						embed_results.addFields({ name: "Resultados", value: result_list });
						embed_results.setDescription(description);
						embed_sent.edit(embed_results);
						embed_sent.reactions.removeAll();
					});
			}
		});
	}

	//////////////////////////////////////////////

	if (msg.content.includes("w!sugerencia")) {
		msg.delete();
	}

	//////////////////////////////////////////////

	if (
		msg.content.includes("dev!updateRoles") &&
		msg.member._roles.find((role) => role === ROLE_DEVELOPER)
	) {
		msg.guild.roles.cache.map((role) => {
			const roleKey = datastore.key(["Role", role.id]);

			const roleEntity = {
				key: roleKey,
				data: {
					name: role.name,
					color: role.color,
				},
			};

			datastore
				.merge(roleEntity)
				.then((res) => {
					console.log(res);
				})
				.catch((err) => {
					console.log("Error saving role: ", err);
				});
		});
	}

	//////////////////////////////////////////////

	if (
		msg.content.includes("dev!addOficialRole") &&
		msg.member._roles.find((role) => role === ROLE_DEVELOPER)
	) {
		let param_role = msg.content.split(" ")[1];

		msg.delete();
		if (param_role) {
			const r = msg.guild.roles.cache.find((role) => param_role === role.name);

			if (!r) {
				embeds.createErrorEmbed(msg.channel, "❌ Rol no encontrado.");
				return;
			}

			const roleKey = datastore.key(["Role", r.id]);

			const roleEntity = {
				key: roleKey,
				data: {
					name: r.name,
					color: r.color,
					oficial: true,
				},
			};

			datastore
				.save(roleEntity)
				.then((res) => {
					console.log(res);
				})
				.catch((err) => {
					console.log("Error saving role: ", err);
				});
		} else {
			embeds.createErrorEmbed(msg.channel, "❌ Error en los parametros.");
			return;
		}
	}

	//////////////////////////////////////////////

	if (
		msg.content.includes("dev!removeOficialRole") &&
		msg.member._roles.find((role) => role === ROLE_DEVELOPER)
	) {
		let param_role = msg.content.split(" ")[1];

		msg.delete();
		if (param_role) {
			const r = msg.guild.roles.cache.find((role) => param_role === role.name);

			if (!r) {
				embeds.createErrorEmbed(msg.channel, "❌ Rol no encontrado.");
				return;
			}

			const roleKey = datastore.key(["Role", r.id]);

			const roleEntity = {
				key: roleKey,
				data: {
					name: r.name,
					color: r.color,
				},
			};

			datastore
				.save(roleEntity)
				.then((res) => {
					console.log(res);
				})
				.catch((err) => {
					console.log("Error saving role: ", err);
				});
		} else {
			embeds.createErrorEmbed(msg.channel, "❌ Error en los parametros.");
			return;
		}
	}

	//////////////////////////////////////////////

	if (
		msg.content.includes("dev!createTicketEmbed") &&
		msg.member._roles.find((role) => role === ROLE_DEVELOPER)
	) {
		msg.channel.send(embeds.createTicketEmbed()).then((message) => {
			message.react("✉️").then((react) => {
				const filter = (reaction, user) => {
					return reaction.emoji.name === "✉️";
				};

				const collector = message.createReactionCollector(filter, {});

				collector.on("collect", (reaction, user) => {
					reaction.users.remove(user.id);

					msg.guild.channels
						.create("ticket-" + user.username, {
							type: "text",
							parent: SUGERENCIAS_CATEGORY,
							permissionOverwrites: [
								{ id: message.guild.id, deny: ["VIEW_CHANNEL"] },
								{ id: user.id, allow: ['VIEW_CHANNEL'] },
							],
							reason: "New ticket channel",
						})
						.then((channel) => {
							channel.send(
								user.toString() +
									" escribe aqui tu sugerencia/problema. Recuerda que es un unico mensaje el que puedes enviar."
							);

							const filter2 = (ticket_message) => {
								return user.id === ticket_message.author.id;
							};

							channel.awaitMessages(filter2, { max: 1 }).then((messages) => {
								let ticket_message;

								messages.forEach((m) => {
									ticket_message = m;
								})
								
								const sug_channel = msg.guild.channels.resolve(SUGERENCIAS_CHANNEL);
								sug_channel.send(embeds.createTicketSentEmbed(ticket_message.author, ticket_message));
								channel.delete();
							});
						});
				});

				collector.on("end", (collected) => {
					console.log(`Collected ${collected.size} items`);
				});
			});
		});
	}

	/////////////////////////////////////////////
});
