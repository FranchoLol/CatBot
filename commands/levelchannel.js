const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { setLevelChannelConfig, getLevelChannelConfig } = require('../utils/experienceUtils');

module.exports = {
  name: 'levelchannel',
  description: 'Configura el canal para los anuncios de subida de nivel',
  usage: 'c!levelchannel [#canal]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const currentConfig = getLevelChannelConfig(message.guild.id);

    if (args.length === 0) {
      if (currentConfig.channelId) {
        const channel = message.guild.channels.cache.get(currentConfig.channelId);
        return message.reply(`El canal actual para anuncios de nivel es ${channel ? channel.toString() : 'un canal desconocido'}.`);
      } else {
        return message.reply('No hay un canal configurado para anuncios de nivel. Usa `c!levelchannel #canal` para configurar uno.');
      }
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('Por favor, menciona un canal válido.');
    }

    setLevelChannelConfig(message.guild.id, channel.id, currentConfig.message);

    message.reply(`Canal de anuncios de nivel actualizado a ${channel}.`);
  },
  data: new SlashCommandBuilder()
    .setName('levelchannel')
    .setDescription('Configura el canal para los anuncios de subida de nivel')
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('El canal para los anuncios de subida de nivel')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const currentConfig = getLevelChannelConfig(interaction.guild.id);

    const channel = interaction.options.getChannel('canal');

    if (!channel) {
      if (currentConfig.channelId) {
        const currentChannel = interaction.guild.channels.cache.get(currentConfig.channelId);
        return interaction.reply(`El canal actual para anuncios de nivel es ${currentChannel ? currentChannel.toString() : 'un canal desconocido'}.`);
      } else {
        return interaction.reply('No hay un canal configurado para anuncios de nivel. Usa este comando con un canal para configurar uno.');
      }
    }

    setLevelChannelConfig(interaction.guild.id, channel.id, currentConfig.message);

    interaction.reply(`Canal de anuncios de nivel actualizado a ${channel}.`);
  },
};

