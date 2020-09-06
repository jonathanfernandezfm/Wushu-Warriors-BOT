const Discord = require("discord.js");
const ERROR_TIMEOUT_TIME = 4000;

const createSucessEmbed = (channel, title, desc, color = "#00d11f", icon = "✅") => {
    const embed = new Discord.MessageEmbed().setColor(color).setTitle(icon + " " + title);
	if (desc) embed.setDescription(desc);

	channel.send(embed);
}

const createErrorEmbed = (channel, text, desc) => {
	const embed = new Discord.MessageEmbed().setColor("#fc2003").setTitle(text);
	if (desc) embed.setDescription(desc);

	channel.send(embed).then((message) => {
		setTimeout(() => message.delete(), ERROR_TIMEOUT_TIME);
	});
};

const editErrorEmbed = (msg, text, desc) => {
	const embed = new Discord.MessageEmbed().setColor("#fc2003").setTitle(text);
	if (desc) embed.setDescription(desc);

	msg.edit(embed).then((message) => {
		setTimeout(() => message.delete(), ERROR_TIMEOUT_TIME);
	});
};

const createApuestaEmbed = () => {
	return new Discord.MessageEmbed()
		.setColor("#fcf003")
		.setTitle("💰 Apuesta")
		.setThumbnail(
			"https://i.pinimg.com/originals/d7/49/06/d74906d39a1964e7d07555e7601b06ad.gif"
		)
		.setTimestamp();
};

const createEmbedRolling = (msg, user_tagged, amount) => {
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
};

const createEmbedFinal = (msg, user_tagged, amount, author_roll, oponent_roll) => {
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
};

const createEncuestaEmbed = (title, description) => {
    return new Discord.MessageEmbed()
			.setTitle("📜 Encuesta: " + title)
			.setDescription(description);
}

const createEncuestaResultsEmbed = (title) => {
    return new Discord.MessageEmbed().setTitle("✅ " + title);
}

module.exports = {
    createSucessEmbed: createSucessEmbed,
	createErrorEmbed: createErrorEmbed,
	editErrorEmbed: editErrorEmbed,
    createApuestaEmbed: createApuestaEmbed,
	createEmbedRolling: createEmbedRolling,
    createEmbedFinal: createEmbedFinal,
    createEncuestaEmbed: createEncuestaEmbed,
    createEncuestaResultsEmbed: createEncuestaResultsEmbed
};
