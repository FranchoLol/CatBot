const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getUserBalance, getEconomyConfig } = require('../utils/economyUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Muestra tu balance actual'),
  async execute(interaction) {
    const { guildId, user } = interaction;
    const userData = getUserBalance(guildId, user.id);
    const config = getEconomyConfig();

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Balance de ${user.username}`)
      .addFields(
        { name: 'Billetera', value: `${userData.balance} ${config.defaultCurrency}`, inline: true },
        { name: 'Banco', value: `${userData.bank} ${config.defaultCurrency}`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

    