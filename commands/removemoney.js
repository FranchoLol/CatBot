const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { getUserBalance, updateUserBalance, getEconomyConfig } = require('../utils/economyUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removemoney')
    .setDescription('Quita dinero a un usuario (Solo para administradores)')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('El usuario al que quieres quitar dinero')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('amount')
        .setDescription('La cantidad de dinero a quitar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('currency')
        .setDescription('La moneda a quitar')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const currency = interaction.options.getString('currency') || getEconomyConfig().defaultCurrency;
    const userData = getUserBalance(interaction.guildId, target.id);
    const config = getEconomyConfig();

    if (!config.currencies.some(c => c.name === currency)) {
      return interaction.reply(`La moneda ${currency} no existe.`);
    }

    if (currency === config.defaultCurrency) {
      if (userData.balance < amount) {
        return interaction.reply(`${target.username} no tiene suficiente ${currency} para quitar.`);
      }
      updateUserBalance(interaction.guildId, target.id, -amount);
    } else {
      if (!userData[currency] || userData[currency] < amount) {
        return interaction.reply(`${target.username} no tiene suficiente ${currency} para quitar.`);
      }
      userData[currency] -= amount;
      updateUserBalance(interaction.guildId, target.id, 0); // This will save the updated userData
    }

    await interaction.reply(`Se han quitado ${amount} ${currency} de la cuenta de ${target.username}.`);
  },
};

