const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { setLevelChannelConfig, getLevelChannelConfig } = require('../utils/experienceUtils');

module.exports = {
  name: 'levelchannelset',
  description: 'Establece un nuevo canal para los anuncios de subida de nivel',
  usage: 'k!levelchannelset <#canal>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('Por favor, menciona un canal válido.');
    }

    const currentConfig = getLevelChannelConfig(message.guild.id);
    setLevelChannelConfig(message.guild.id, channel.id, currentConfig.message);

    message.reply(`Canal de anuncios de nivel actualizado a ${channel}. El mensaje personalizado se ha mantenido.`);
  },
  data: new SlashCommandBuilder()
    .setName('levelchannelset')
    .setDescription('Establece un nuevo canal para los anuncios de subida de nivel')
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('El nuevo canal para los anuncios de subida de nivel')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('canal');
    const currentConfig = getLevelChannelConfig(interaction.guild.id);
    setLevelChannelConfig(interaction.guild.id, channel.id, currentConfig.message);

    interaction.reply(`Canal de anuncios de nivel actualizado a ${channel}. El mensaje personalizado se ha mantenido.`);
  },
};

