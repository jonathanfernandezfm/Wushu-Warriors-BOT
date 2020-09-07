const Discord = require("discord.js");
const ERROR_TIMEOUT_TIME = 4000;

module.exports = {
	createSucessEmbed: (channel, title, desc, color = "#00d11f", icon = "✅") => {
		const embed = new Discord.MessageEmbed().setColor(color).setTitle(icon + " " + title);
		if (desc) embed.setDescription(desc);

		channel.send(embed);
	},
	createErrorEmbed: (channel, text, desc) => {
		const embed = new Discord.MessageEmbed().setColor("#fc2003").setTitle(text);
		if (desc) embed.setDescription(desc);

		channel.send(embed).then((message) => {
			setTimeout(() => message.delete(), ERROR_TIMEOUT_TIME);
		});
	},
	editErrorEmbed: (msg, text, desc) => {
		const embed = new Discord.MessageEmbed().setColor("#fc2003").setTitle(text);
		if (desc) embed.setDescription(desc);

		msg.edit(embed).then((message) => {
			setTimeout(() => message.delete(), ERROR_TIMEOUT_TIME);
		});
	},

	createApuestaEmbed: () => {
		return new Discord.MessageEmbed()
			.setColor("#fcf003")
			.setTitle("💰 Apuesta")
			.setThumbnail(
				"https://i.pinimg.com/originals/d7/49/06/d74906d39a1964e7d07555e7601b06ad.gif"
			)
			.setTimestamp();
	},

	createEmbedRolling: (msg, user_tagged, amount) => {
		return new Discord.MessageEmbed()
			.setColor("#00d1a4")
			.setTitle("🎲 Rolling")
			.addFields(
				{ name: "Autor:", value: msg.author, inline: true },
				{
					name: "Cantidad a apostar:",
					value: amount + " 🟡",
					inline: true,
				},
				{ name: "Oponente:", value: user_tagged }
			)
			.setThumbnail("https://i.gifer.com/origin/58/588a818c855cd3e2c39f853e4515b66d.gif")
			.setTimestamp();
	},

	createEmbedFinal: (msg, user_tagged, amount, author_roll, oponent_roll) => {
		return new Discord.MessageEmbed()
			.setColor("#00d11f")
			.setTitle("🎲 Rolled")
			.addFields(
				{ name: "Autor:", value: msg.author, inline: true },
				{ name: "Oponente:", value: user_tagged, inline: true },
				{ name: "Apuesta:", value: amount + " 🟡", inline: true },
				{
					name: "Resultados:",
					value: `${msg.author} ${author_roll}\n ${user_tagged} ${oponent_roll}`,
				}
			)
			.setThumbnail(
				"https://i.pinimg.com/originals/d7/49/06/d74906d39a1964e7d07555e7601b06ad.gif"
			)
			.setTimestamp();
	},

	createEncuestaEmbed: (title, description) => {
		return new Discord.MessageEmbed()
			.setTitle("📜 Encuesta: " + title)
			.setDescription(description);
	},

	createEncuestaResultsEmbed: (title) => {
		return new Discord.MessageEmbed().setTitle("✅ " + title);
	},

	createTicketEmbed: () => {
		return new Discord.MessageEmbed()
			.setColor("#4587f7")
			.setTitle("📨 Sugerencia/Ticket")
			.setDescription(
				"Reacciona al icono aqui abajo para ponerte en contacto con los oficiales. Un nuevo canal será creado solo para ti (revisa los tags) en el que podrás escribir cualquier sugerencia o problema de manera privada al resto de usuarios y será enviada a los oficiales."
			)
			.setThumbnail(
				"https://media1.tenor.com/images/0b46edf37db3fd5d9ce71c9763bef6af/tenor.gif"
			);
	},

	createTicketSentEmbed: (user, message) => {
		return new Discord.MessageEmbed()
			.setTitle("📨 Ticket")
			.setDescription("**Usuario**: " + user.toString() + "\n\n" + message.content);
	},
};
