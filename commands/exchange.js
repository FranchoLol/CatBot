const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserBalance, updateUserBalance, getEconomyConfig } = require('../utils/economyUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exchange')
    .setDescription('Cambia una moneda por otra')
    .addStringOption(option =>
      option.setName('from')
        .setDescription('La moneda que quieres cambiar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('to')
        .setDescription('La moneda que quieres obtener')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('amount')
        .setDescription('La cantidad que quieres cambiar')
        .setRequired(true)),
  async execute(interaction) {
    const fromCurrency = interaction.options.getString('from');
    const toCurrency = interaction.options.getString('to');
    const amount = interaction.options.getInteger('amount');
    const { guildId, user } = interaction;
    const userData = getUserBalance(guildId, user.id);
    const config = getEconomyConfig();

    if (!config.currencies.some(c => c.name === fromCurrency) || !config.currencies.some(c => c.name === toCurrency)) {
      return interaction.reply('Una de las monedas especificadas no existe.');
    }

    const exchangeRate = config.exchangeRates[`${fromCurrency}_to_${toCurrency}`];
    if (!exchangeRate) {
      return interaction.reply('No hay una tasa de cambio definida para estas monedas.');
    }

    if (fromCurrency === config.defaultCurrency) {
      if (userData.balance < amount) {
        return interaction.reply(`No tienes suficiente ${fromCurrency} para hacer este cambio.`);
      }
      updateUserBalance(guildId, user.id, -amount);
    } else {
      if (!userData[fromCurrency] || userData[fromCurrency] < amount) {
        return interaction.reply(`No tienes suficiente ${fromCurrency} para hacer este cambio.`);
      }
      userData[fromCurrency] -= amount;
    }

    const convertedAmount = Math.floor(amount * exchangeRate);
    if (toCurrency === config.defaultCurrency) {
      updateUserBalance(guildId, user.id, convertedAmount);
    } else {
      userData[toCurrency] = (userData[toCurrency] || 0) + convertedAmount;
    }

    updateUserBalance(guildId, user.id, 0); // This will save the updated userData

    await interaction.reply(`Has cambiado ${amount} ${fromCurrency} por ${convertedAmount} ${toCurrency}.`);
  },
};

