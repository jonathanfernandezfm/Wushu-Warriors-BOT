const embeds = require("../../../embeds");
const emojiCharacters = require("../../../emojis");

module.exports = {
	createEncuesta: (msg) => {
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
		msg.channel
			.send(encuestaEmbed)
			.then(async (embed_sent) => {
				for (let i = 0; i < values.length; i++) {
					if (values[i].length !== 0)
						await embed_sent.react(emojiCharacters[String.fromCharCode(letra + i)]);
				}

				if (msg.content.includes("w!multiEncuesta")) {
					embed_sent
						.awaitReactions(filter, { time: time * 60000, errors: ["time"] })
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
					const collector = embed_sent.createReactionCollector(filter, {
						time: time * 60000,
						errors: ["time"],
					});

					collector.on("collect", (reaction, user) => {
						embed_sent.reactions.cache.forEach((react) => {
							if (react._emoji.name !== reaction._emoji.name) {
								react.users.remove(user.id);
							}
						});
					});

					collector.on("end", (collected) => {
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
			})
			.catch((err) => {
				console.warn(err);
			});
	},
};
