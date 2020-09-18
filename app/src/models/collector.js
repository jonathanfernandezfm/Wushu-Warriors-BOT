// Cargamos el módulo de mongoose
const mongoose = require("mongoose");
//Definimos los esquemas
const Schema = mongoose.Schema;

// Creamos el objeto del esquema con sus correspondientes campos
const CollectorSchema = new Schema({
	messageId: {
		type: String,
		required: true,
	},
	channelId: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
});

// Exportamos el modelo para usarlo en otros ficheros
module.exports = mongoose.model("Collector", CollectorSchema);
