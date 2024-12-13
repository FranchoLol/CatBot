const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserBalance, updateUserBalance, getEconomyConfig } = require('../utils/economyUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Recibe tu recompensa diaria'),
  async execute(interaction) {
    const { guildId, user } = interaction;
    const userData = getUserBalance(guildId, user.id);
    const config = getEconomyConfig();
    const now = Date.now();

    if (now - userData.lastDaily < config.dailyCooldown) {
      const timeLeft = config.dailyCooldown - (now - userData.lastDaily);
      return interaction.reply(`Debes esperar ${Math.ceil(timeLeft / 3600000)} horas para tu próxima recompensa diaria.`);
    }

    updateUserBalance(guildId, user.id, config.dailyAmount);
    userData.lastDaily = now;

    await interaction.reply(`Has recibido tu recompensa diaria de ${config.dailyAmount} ${config.defaultCurrency}!`);
  },
};

