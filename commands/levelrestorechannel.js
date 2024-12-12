const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { removeLimitedChannel, getLimitedChannels } = require('../utils/experienceUtils');

module.exports = {
  name: 'levelrestorechannel',
  description: 'Restaura la ganancia de XP en canales específicos',
  usage: 'c!levelrestorechannel #canal1, #canal2, ...',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const channels = message.mentions.channels;
    if (channels.size === 0) {
      return message.reply('Por favor, menciona al menos un canal.');
    }

    channels.forEach(channel => {
      removeLimitedChannel(message.guild.id, channel.id);
    });

    const limitedChannels = getLimitedChannels(message.guild.id);
    const channelMentions = limitedChannels.length > 0 
      ? limitedChannels.map(id => `<#${id}>`).join(', ')
      : 'Ninguno';

    message.reply(`Canales restaurados. Los siguientes canales siguen sin ganar XP: ${channelMentions}`);
  },
  data: new SlashCommandBuilder()
    .setName('levelrestorechannel')
    .setDescription('Restaura la ganancia de XP en canales específicos')
    .addStringOption(option =>
      option.setName('canales')
        .setDescription('Los canales a restaurar (separados por comas)')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const channelsInput = interaction.options.getString('canales');
    const channelIds = channelsInput.split(',').map(id => id.trim().replace(/[<#>]/g, ''));

    channelIds.forEach(id => {
      removeLimitedChannel(interaction.guild.id, id);
    });

    const limitedChannels = getLimitedChannels(interaction.guild.id);
    const channelMentions = limitedChannels.length > 0 
      ? limitedChannels.map(id => `<#${id}>`).join(', ')
      : 'Ninguno';

    interaction.reply(`Canales restaurados. Los siguientes canales siguen sin ganar XP: ${channelMentions}`);
  },
};

