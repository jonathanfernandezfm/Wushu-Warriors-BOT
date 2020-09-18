const embeds = require("../../../embeds");

module.exports = {
	addOficialRole: (msg) => {
		let param_role = msg.content.replace("dev!addOficialRole ", "");

		msg.delete();
		if (param_role) {
			const r = msg.guild.roles.cache.find((role) => param_role === role.name);

			if (!r) {
				embeds.createErrorEmbed(msg.channel, "❌ Rol no encontrado.");
				return;
			}

			// TODO: Añadir role oficial db
		} else {
			embeds.createErrorEmbed(msg.channel, "❌ Error en los parametros.");
			return;
		}
	},
	removeOficialRole: (msg) => {
		let param_role = msg.content.replace("dev!removeOficialRole ", "");

		msg.delete();
		if (param_role) {
			const r = msg.guild.roles.cache.find((role) => param_role === role.name);

			if (!r) {
				embeds.createErrorEmbed(msg.channel, "❌ Rol no encontrado.");
				return;
			}

			// TODO: Borrar role db
		} else {
			embeds.createErrorEmbed(msg.channel, "❌ Error en los parametros.");
			return;
		}
	},
	updateRoles: (msg) => {
		msg.guild.roles.cache.map((role) => {
			// TODO: Añadir rol a db
		});
	},
};
