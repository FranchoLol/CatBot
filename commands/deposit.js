const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserBalance, updateUserBalance, getEconomyConfig } = require('../utils/economyUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposita dinero en el banco')
    .addIntegerOption(option => 
      option.setName('amount')
        .setDescription('La cantidad a depositar')
        .setRequired(true)),
  async execute(interaction) {
    const { guildId, user } = interaction;
    const amount = interaction.options.getInteger('amount');
    const userData = getUserBalance(guildId, user.id);
    const config = getEconomyConfig();

    if (amount <= 0) return interaction.reply('La cantidad debe ser positiva.');
    if (amount > userData.balance) return interaction.reply('No tienes suficiente dinero en tu billetera.');

    updateUserBalance(guildId, user.id, -amount, 'balance');
    updateUserBalance(guildId, user.id, amount, 'bank');

    await interaction.reply(`Has depositado ${amount} ${config.defaultCurrency} en tu cuenta bancaria.`);
  },
};

