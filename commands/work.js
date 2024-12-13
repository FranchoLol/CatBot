const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserBalance, updateUserBalance, getEconomyConfig } = require('../utils/economyUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Trabaja para ganar dinero'),
  async execute(interaction) {
    const { guildId, user } = interaction;
    const userData = getUserBalance(guildId, user.id);
    const config = getEconomyConfig();
    const now = Date.now();

    if (now - userData.lastWork < config.workCooldown) {
      const timeLeft = config.workCooldown - (now - userData.lastWork);
      return interaction.reply(`Debes esperar ${Math.ceil(timeLeft / 60000)} minutos antes de volver a trabajar.`);
    }

    const earned = Math.floor(Math.random() * (config.workAmount.max - config.workAmount.min + 1)) + config.workAmount.min;
    updateUserBalance(guildId, user.id, earned);
    userData.lastWork = now;

    await interaction.reply(`Has trabajado duro y ganado ${earned} ${config.defaultCurrency}!`);
  },
};

