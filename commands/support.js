const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'support',
  description: 'Muestra información sobre el servidor de soporte',
  usage: 'k!support',
  run: async (client, message, args) => {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Servidor de Soporte')
      .setDescription('¿Necesitas ayuda o tienes alguna pregunta? ¡Únete a nuestro servidor de soporte!')
      .addFields(
        { name: 'Enlace de invitación', value: '[Unirse al servidor de soporte](https://discord.gg/kinshipdevs)' }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
  data: {
    name: 'support',
    description: 'Muestra información sobre el servidor de soporte',
  },
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Servidor de Soporte')
      .setDescription('¿Necesitas ayuda o tienes alguna pregunta? ¡Únete a nuestro servidor de soporte!')
      .addFields(
        { name: 'Enlace de invitación', value: '[Unirse al servidor de soporte](https://discord.gg/kinshipdevs)' }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

