const embeds = require("../../../embeds");
const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();

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
					console.warn("Error saving role: ", err);
				});
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
	},
	updateRoles: (msg) => {
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
					console.warn("Error saving role: ", err);
				});
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
						const collectorKey = datastore.key(["Collector", ticket_embed_message.id]);

						const collectorEntity = {
							key: collectorKey,
							data: {
								channel: ticket_embed_message.channel.id,
								type: "ticket",
							},
						};

						datastore
							.save(collectorEntity)
							.then((res) => {
								console.log(res);
							})
							.catch((err) => {
								console.warn("Error saving collector: ", err);
							});

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
