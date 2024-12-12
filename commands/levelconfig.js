const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getLevelChannelConfig, getLevelMessageConfig } = require('../utils/experienceUtils');

module.exports = {
  name: 'levelconfig',
  description: 'Muestra la configuración actual del sistema de niveles',
  usage: 'k!levelconfig',
  run: async (client, message, args) => {
    const channelConfig = getLevelChannelConfig(message.guild.id);
    const messageConfig = getLevelMessageConfig(message.guild.id);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Configuración del Sistema de Niveles')
      .addFields(
        { name: 'Canal de anuncios', value: channelConfig.channelId ? `<#${channelConfig.channelId}>` : 'No configurado' },
        { name: 'Mensaje personalizado', value: messageConfig.enabled ? 'Habilitado' : 'Deshabilitado' },
        { name: 'Color del mensaje', value: messageConfig.color || 'No configurado' },
        { name: 'ID de emoji/GIF', value: messageConfig.id || 'No configurado' },
        { name: 'Mostrar fecha/hora', value: messageConfig.showDateTime ? 'Sí' : 'No' }
      );

    message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('levelconfig')
    .setDescription('Muestra la configuración actual del sistema de niveles'),
  async execute(interaction) {
    const channelConfig = getLevelChannelConfig(interaction.guild.id);
    const messageConfig = getLevelMessageConfig(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Configuración del Sistema de Niveles')
      .addFields(
        { name: 'Canal de anuncios', value: channelConfig.channelId ? `<#${channelConfig.channelId}>` : 'No configurado' },
        { name: 'Mensaje personalizado', value: messageConfig.enabled ? 'Habilitado' : 'Deshabilitado' },
        { name: 'Color del mensaje', value: messageConfig.color || 'No configurado' },
        { name: 'ID de emoji/GIF', value: messageConfig.id || 'No configurado' },
        { name: 'Mostrar fecha/hora', value: messageConfig.showDateTime ? 'Sí' : 'No' }
      );

    interaction.reply({ embeds: [embed] });
  },
};
