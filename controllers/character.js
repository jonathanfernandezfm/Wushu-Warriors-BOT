const characterModel = require('../models/character');
module.exports = {
    create: (discord_user, character_name) => {
        return characterModel.create({ discord_user: discord_user, character_name: character_name });
    },
    update: (discord_user, character_name) => {
        return characterModel.updateOne({ discord_user: discord_user }, {character_name: character_name});
    },
    find: (discord_user) => {
        return characterModel.findOne({ discord_user: discord_user });
    },
    delete: (discord_user) => {
        return characterModel.deleteOne({ discord_user: discord_user });
    }
}