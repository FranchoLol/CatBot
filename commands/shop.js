const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getShopItems, getEconomyConfig } = require('../utils/economyUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Muestra los items disponibles en la tienda'),
  async execute(interaction) {
    const config = getEconomyConfig();
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Tienda')
      .setDescription('Estos son los items disponibles para comprar:');

    for (const item of getShopItems()) {
      embed.addFields({ name: item.name, value: `Precio: ${item.price} ${config.defaultCurrency}\nStock: ${item.stock === -1 ? 'Ilimitado' : item.stock}`, inline: true });
    }

    await interaction.reply({ embeds: [embed] });
  },
};

