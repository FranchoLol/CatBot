const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getUserBalance, getEconomyConfig } = require('../utils/economyUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Muestra tu inventario'),
  async execute(interaction) {
    const { guildId, user } = interaction;
    const userData = getUserBalance(guildId, user.id);
    const config = getEconomyConfig();

    const inventoryCounts = userData.inventory.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Inventario de ${user.username}`)
      .setDescription('Estos son los items en tu inventario:');

    for (const [item, count] of Object.entries(inventoryCounts)) {
      embed.addFields({ name: item, value: `Cantidad: ${count}`, inline: true });
    }

    await interaction.reply({ embeds: [embed] });
  },
};

