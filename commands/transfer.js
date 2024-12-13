const { SlashCommandBuilder } = require('@discordjs/builders');
const { transferMoney, getEconomyConfig } = require('../utils/economyUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfiere dinero a otro usuario')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('El usuario al que quieres transferir dinero')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('amount')
        .setDescription('La cantidad a transferir')
        .setRequired(true)),
  async execute(interaction) {
    const { guildId, user } = interaction;
    const target = interaction.options.getUser('target');
    const amount = interaction.options.getInteger('amount');
    const config = getEconomyConfig();

    if (target.id === user.id) return interaction.reply('No puedes transferirte dinero a ti mismo.');
    if (amount <= 0) return interaction.reply('La cantidad debe ser positiva.');

    const result = transferMoney(guildId, user.id, target.id, amount);
    if (!result.success) return interaction.reply('No tienes suficiente dinero en tu billetera.');

    await interaction.reply(`Has transferido ${result.transferAmount} ${config.defaultCurrency} a ${target.username}. Se aplicó un impuesto de ${result.tax} ${config.defaultCurrency}.`);
  },
};

