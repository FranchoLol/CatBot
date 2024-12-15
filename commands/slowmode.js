const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'slowmode',
  description: 'Establece el modo lento en un canal',
  usage: 'c!slowmode [#canal/id] <tiempo>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    let channel = message.mentions.channels.first() || message.channel;
    let time = args[0];

    if (message.mentions.channels.first()) {
      time = args[1];
    }

    if (!time) {
      return message.reply('Por favor, especifica un tiempo para el modo lento.');
    }

    const milliseconds = ms(time);
    if (isNaN(milliseconds)) {
      return message.reply('Por favor, proporciona un tiempo válido (e.g., 5s, 1m, 2h).');
    }

    await channel.setRateLimitPerUser(milliseconds / 1000);
    message.reply(`El modo lento en ${channel} ha sido establecido a ${time}.`);
  },
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Establece el modo lento en un canal')
    .addChannelOption(option => 
      option.setName('canal')
        .setDescription('El canal para establecer el modo lento')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('tiempo')
        .setDescription('El tiempo para el modo lento (e.g., 5s, 1m, 2h)')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('canal') || interaction.channel;
    const time = interaction.options.getString('tiempo');

    const milliseconds = ms(time);
    if (isNaN(milliseconds)) {
      return interaction.reply({ content: 'Por favor, proporciona un tiempo válido (e.g., 5s, 1m, 2h).', ephemeral: true });
    }

    await channel.setRateLimitPerUser(milliseconds / 1000);
    interaction.reply(`El modo lento en ${channel} ha sido establecido a ${time}.`);
  },
};

