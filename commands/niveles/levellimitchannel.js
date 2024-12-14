const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { addLimitedChannel, getLimitedChannels } = require('../../utils/experienceUtils');

module.exports = {
  name: 'levellimitchannel',
  description: 'Limita la ganancia de XP en canales específicos',
  usage: 'c!levellimitchannel #canal1, #canal2, ...',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const channels = message.mentions.channels;
    if (channels.size === 0) {
      return message.reply('Por favor, menciona al menos un canal.');
    }

    channels.forEach(channel => {
      addLimitedChannel(message.guild.id, channel.id);
    });

    const limitedChannels = getLimitedChannels(message.guild.id);
    const channelMentions = limitedChannels.map(id => `<#${id}>`).join(', ');

    message.reply(`Canales limitados actualizados. Los siguientes canales no ganarán XP: ${channelMentions}`);
  },
  data: new SlashCommandBuilder()
    .setName('levellimitchannel')
    .setDescription('Limita la ganancia de XP en canales específicos')
    .addStringOption(option =>
      option.setName('canales')
        .setDescription('Los canales a limitar (separados por comas)')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const channelsInput = interaction.options.getString('canales');
    const channelIds = channelsInput.split(',').map(id => id.trim().replace(/[<#>]/g, ''));

    channelIds.forEach(id => {
      addLimitedChannel(interaction.guild.id, id);
    });

    const limitedChannels = getLimitedChannels(interaction.guild.id);
    const channelMentions = limitedChannels.map(id => `<#${id}>`).join(', ');

    interaction.reply(`Canales limitados actualizados. Los siguientes canales no ganarán XP: ${channelMentions}`);
  },
};

