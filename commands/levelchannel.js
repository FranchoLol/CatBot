const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { setLevelChannelConfig } = require('../utils/experienceUtils');

module.exports = {
  name: 'levelchannel',
  description: 'Configura el canal y mensaje para los anuncios de subida de nivel',
  usage: 'k!levelchannel <#canal> [mensaje]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('Por favor, menciona un canal válido.');
    }

    const customMessage = args.slice(1).join(' ');
    setLevelChannelConfig(message.guild.id, channel.id, customMessage);

    message.reply(`Canal de anuncios de nivel configurado a ${channel}. ${customMessage ? 'Mensaje personalizado guardado.' : 'Se usará el mensaje predeterminado.'}`);
  },
  data: new SlashCommandBuilder()
    .setName('levelchannel')
    .setDescription('Configura el canal y mensaje para los anuncios de subida de nivel')
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('El canal para los anuncios de subida de nivel')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('mensaje')
        .setDescription('El mensaje personalizado para los anuncios de subida de nivel')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('canal');
    const customMessage = interaction.options.getString('mensaje');

    setLevelChannelConfig(interaction.guild.id, channel.id, customMessage);

    interaction.reply(`Canal de anuncios de nivel configurado a ${channel}. ${customMessage ? 'Mensaje personalizado guardado.' : 'Se usará el mensaje predeterminado.'}`);
  },
};

