const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserBalance, updateUserBalance, getEconomyConfig } = require('../utils/economyUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Intenta robar a otro usuario')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('El usuario al que intentas robar')
        .setRequired(true)),
  async execute(interaction) {
    const { guildId, user } = interaction;
    const target = interaction.options.getUser('target');
    if (target.id === user.id) return interaction.reply('No puedes robarte a ti mismo.');

    const userData = getUserBalance(guildId, user.id);
    const targetData = getUserBalance(guildId, target.id);
    const config = getEconomyConfig();

    if (Math.random() > config.robChance) {
      return interaction.reply('Has sido atrapado intentando robar. Mejor suerte la próxima vez.');
    }

    const stolenAmount = Math.floor(targetData.balance * config.robPercentage);
    updateUserBalance(guildId, user.id, stolenAmount);
    updateUserBalance(guildId, target.id, -stolenAmount);

    await interaction.reply(`Has robado exitosamente ${stolenAmount} ${config.defaultCurrency} de ${target.username}!`);
  },
};

