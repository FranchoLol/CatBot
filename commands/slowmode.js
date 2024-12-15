const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

const slowmodeOptions = [
  { name: 'Apagado', value: '0', shortFormat: 'off/0' },
  { name: '5 segundos', value: '5', shortFormat: '5s' },
  { name: '10 segundos', value: '10', shortFormat: '10s' },
  { name: '15 segundos', value: '15', shortFormat: '15s' },
  { name: '30 segundos', value: '30', shortFormat: '30s' },
  { name: '1 minuto', value: '60', shortFormat: '1m' },
  { name: '2 minutos', value: '120', shortFormat: '2m' },
  { name: '5 minutos', value: '300', shortFormat: '5m' },
  { name: '10 minutos', value: '600', shortFormat: '10m' },
  { name: '15 minutos', value: '900', shortFormat: '15m' },
  { name: '30 minutos', value: '1800', shortFormat: '30m' },
  { name: '1 hora', value: '3600', shortFormat: '1h' },
  { name: '2 horas', value: '7200', shortFormat: '2h' },
  { name: '6 horas', value: '21600', shortFormat: '6h' }
];

module.exports = {
  name: 'slowmode',
  description: 'Establece el modo lento en un canal',
  usage: 'c!slowmode [#canal] <tiempo>',
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

    const option = slowmodeOptions.find(opt => 
      opt.name.toLowerCase() === time.toLowerCase() || 
      opt.shortFormat === time.toLowerCase() ||
      opt.value === time
    );

    if (!option) {
      const availableOptions = slowmodeOptions.map(opt => `${opt.shortFormat} (${opt.name})`).join(', ');
      return message.reply(`Por favor, proporciona un tiempo válido. Opciones disponibles: ${availableOptions}`);
    }

    await channel.setRateLimitPerUser(parseInt(option.value));
    message.reply(`El modo lento en ${channel} ha sido establecido a ${option.name}.`);
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
        .setDescription('El tiempo para el modo lento')
        .setRequired(true)
        .addChoices(...slowmodeOptions)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('canal') || interaction.channel;
    const time = interaction.options.getString('tiempo');

    const option = slowmodeOptions.find(opt => opt.value === time);
    if (!option) {
      const availableOptions = slowmodeOptions.map(opt => `${opt.shortFormat} (${opt.name})`).join(', ');
      return interaction.reply({ content: `Por favor, proporciona un tiempo válido. Opciones disponibles: ${availableOptions}`, ephemeral: true });
    }

    await channel.setRateLimitPerUser(parseInt(time));
    interaction.reply(`El modo lento en ${channel} ha sido establecido a ${option.name}.`);
  },
};

