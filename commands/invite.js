const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'invite',
  description: 'Muestra el enlace de invitación del bot',
  usage: 'k!invite',
  run: async (client, message, args) => {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Invita al bot a tu servidor')
      .setDescription('Haz clic en el enlace de abajo para invitar al bot a tu servidor:')
      .addFields(
        { name: 'Enlace de invitación', value: '[Invitar bot](https://discord.com/oauth2/authorize?client_id=758327682546794526&permissions=8&scope=bot)' }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
  data: {
    name: 'invite',
    description: 'Muestra el enlace de invitación del bot',
  },
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Invita al bot a tu servidor')
      .setDescription('Haz clic en el enlace de abajo para invitar al bot a tu servidor:')
      .addFields(
        { name: 'Enlace de invitación', value: '[Invitar bot](https://discord.com/oauth2/authorize?client_id=758327682546794526&permissions=8&scope=bot)' }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

