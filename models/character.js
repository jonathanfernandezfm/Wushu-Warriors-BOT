const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
    discord_user: {
        type: String,
        unique: true
    },
    character_name: String,
})

module.exports = mongoose.model('Character', CharacterSchema);