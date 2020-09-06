const Discord = require("discord.js");
const WoWApi = require("./lib/wow/wow");
const auth = require("./auth.json");
const mongoose = require("./database");
const bot = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });
const wowApi = new WoWApi(auth.wow.client, auth.wow.client_secret, "eu", "dun-modr", "en_EU");
const emojiCharacters = require("./emojis.js");
const {
	createSucessEmbed,
	createErrorEmbed,
	editErrorEmbed,
	createEmbedRolling,
	createEmbedFinal,
	createApuestaEmbed,
	createEncuestaEmbed,
	createEncuestaResultsEmbed,
} = require("./embeds.js");

const ROLE_OFICIAL = "751910138092453900";

const Character = require("./controllers/character");

wowApi.login();
bot.login(auth.discord.token);

bot.on("ready", (evt) => {
	console.log("Bot started!");
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
			createErrorEmbed(msg.channel, "❌ No puedes apostar contigo mismo");
			return;
		}

		if (!first_parameter) {
			createErrorEmbed(msg.channel, "❌ Error en el comando.", "Uso: w!bet @usuario 100");
			return;
		}

		if (!second_parameter) {
			amount = parseInt(first_parameter);
			user_tagged = undefined;
		} else if (second_parameter) {
			amount = parseInt(second_parameter);
		} else {
			createErrorEmbed(msg.channel, "❌ Error en el comando", "Uso: w!bet @usuario 100");
			return;
		}

		if (!amount) {
			createErrorEmbed(msg.channel, "❌ Cantidad errónea", "Uso: w!bet @usuario 100");
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

		const embed = createApuestaEmbed();

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
								const embed_rolling = createEmbedRolling(msg, user_tagged, amount);

								let author_roll = Math.floor(Math.random() * 6) + 1;
								let oponent_roll = Math.floor(Math.random() * 6) + 1;
								let winner;
								if (author_roll > oponent_roll) winner = msg.author;
								else if (oponent_roll > author_roll) winner = user_tagged;
								else winner = undefined;

								const embed_final = createEmbedFinal(
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
								editErrorEmbed(msg_sended, "❌ Apuesta cancelada");
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
			createErrorEmbed(msg.channel, param_error, desc_error);
			return;
		}

		if (!time) {
			createErrorEmbed(msg.channel, param_error, desc_error);
			return;
		}

		if (values.length < 1) {
			createErrorEmbed(msg.channel, param_error, desc_error);
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

		const encuestaEmbed = createEncuestaEmbed(title, description);

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
						const embed_results = createEncuestaResultsEmbed(title);

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
						const embed_results = createEncuestaResultsEmbed(title);

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

	if (msg.content.includes("w!addChar")) {
		let values = msg.content.split(" ");
		let character_name = values[values.length - 1];
		let discord_user;

		msg.delete();
		if (values.length <= 1) {
			createErrorEmbed(
				msg.channel,
				"❌ Error en el comando.",
				"Uso: \nw!addChar wow_character_name\nw!addChar @user wow_character_name"
			);
			return;
		}

		if (msg.mentions.users.size > 1) {
			createErrorEmbed(msg.channel, "❌ Error en el comando.", "Tagea solo un usuario");
			return;
		}

		msg.mentions.users.forEach((u) => {
			discord_user = u;
		});

		if (!character_name) {
			createErrorEmbed(
				msg.channel,
				"❌ Error en el comando.",
				"Uso: \nw!addChar wow_character_name\nw!addChar @user wow_character_name"
			);
			return;
		}

		if (!discord_user) discord_user = msg.author;

		if (
			Character.find(discord_user) &&
			!msg.member._roles.find((role) => role === ROLE_OFICIAL)
		) {
			createErrorEmbed(msg.channel, "❌ Jugador ya asignado. Contacta con un Oficial");
			return;
		}

		wowApi
			.getGuildRoster("wushu-warriors")
			.then((guild) => {
				let player = guild.data.members.find(
					(player) => player.character.name === character_name
				);

				if (!player) {
					createErrorEmbed(
						msg.channel,
						`❌ Jugador ${character_name} no encontrado.`,
						"Debes formar parte de la hermandad"
					);
					return;
				}

				Character.create(discord_user.id, character_name)
					.then((item) => {
						createSucessEmbed(
							msg.channel,
							"Personaje añadido",
							discord_user.toString() + ": " + character_name
						);
						msg.guild.members.fetch(discord_user.id).then((member) => {
							member
								.setNickname(character_name)
								.then((member) => {})
								.catch((err) => {
									console.log(err);
								});
						});
					})
					.catch((item) => {
						Character.update(discord_user.id, character_name)
							.then((item) => {
								createSucessEmbed(
									msg.channel,
									"Personaje actualizado",
									discord_user.toString() + ": " + character_name,
									"#fcf003"
								);

								msg.guild.members.fetch(discord_user.id).then((member) => {
									member
										.setNickname(character_name)
										.then((member) => {})
										.catch((err) => {
											console.log(err);
										});
								});
							})
							.catch((err) => {
								createErrorEmbed(
									msg.channel,
									"❌ Error interno.",
									"Uso: \nw!addChar wow_character_name\nw!addChar @user wow_character_name"
								);
							});
					});
			})
			.catch((err) => {
				console.log(err);
			});
	}

	if (msg.content.includes("w!deleteChar")) {
		let discord_user;

		msg.delete();

		if (msg.mentions.users.size > 1) {
			createErrorEmbed(msg.channel, "❌ Error en el comando.", "Tagea solo un usuario");
			return;
		}

		msg.mentions.users.forEach((u) => {
			discord_user = u;
		});

		if (!discord_user) discord_user = msg.author;

		Character.delete(discord_user.id)
			.then((deleted) => {
				if (deleted.deletedCount != 0) {
					createSucessEmbed(
						msg.channel,
						"Personaje eliminado",
						discord_user.toString(),
						"#f56942",
						"⭕"
					);
					msg.guild.members.fetch(discord_user.id).then((member) => {
						member
							.setNickname("")
							.then((member) => {})
							.catch((err) => {
								console.log(err);
							});
					});
				} else {
					createErrorEmbed(msg.channel, "❌ No hay personaje asociado a este usuario.");
				}
			})
			.catch((err) => {
				console.log("Error deleting user" + err);
			});
	}
});
