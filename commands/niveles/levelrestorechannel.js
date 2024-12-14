const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { removeLimitedChannel, getLimitedChannels } = require('../../utils/experienceUtils');

module.exports = {
  name: 'levelrestorechannel',
  description: 'Restaura la ganancia de XP en canales específicos',
  usage: 'c!levelrestorechannel [#canal1] [#canal2] ...',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const limitedChannels = getLimitedChannels(message.guild.id);

    if (limitedChannels.length === 0) {
      return message.reply('No hay canales limitados para restaurar.');
    }

    if (args.length === 0) {
      const channelMentions = limitedChannels.map(id => `<#${id}>`).join(', ');
      return message.reply(`Canales limitados actuales: ${channelMentions}\nUsa \`c!levelrestorechannel #canal1 #canal2 ...\` para restaurar canales específicos.`);
    }

    const channels = message.mentions.channels;
    if (channels.size === 0) {
      return message.reply('Por favor, menciona al menos un canal válido.');
    }

    channels.forEach(channel => {
      removeLimitedChannel(message.guild.id, channel.id);
    });

    const updatedLimitedChannels = getLimitedChannels(message.guild.id);
    const channelMentions = updatedLimitedChannels.length > 0 
      ? updatedLimitedChannels.map(id => `<#${id}>`).join(', ')
      : 'Ninguno';

    message.reply(`Canales restaurados. Los siguientes canales siguen sin ganar XP: ${channelMentions}`);
  },
  data: new SlashCommandBuilder()
    .setName('levelrestorechannel')
    .setDescription('Restaura la ganancia de XP en canales específicos')
    .addStringOption(option =>
      option.setName('canales')
        .setDescription('Los canales a restaurar (separados por espacios)')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const limitedChannels = getLimitedChannels(interaction.guild.id);

    if (limitedChannels.length === 0) {
      return interaction.reply('No hay canales limitados para restaurar.');
    }

    const channelsInput = interaction.options.getString('canales');

    if (!channelsInput) {
      const channelMentions = limitedChannels.map(id => `<#${id}>`).join(', ');
      return interaction.reply(`Canales limitados actuales: ${channelMentions}\nUsa \`/levelrestorechannel canales:#canal1 #canal2 ...\` para restaurar canales específicos.`);
    }

    const channelIds = channelsInput.split(/\s+/).map(id => id.replace(/[<#>]/g, ''));

    channelIds.forEach(id => {
      removeLimitedChannel(interaction.guild.id, id);
    });

    const updatedLimitedChannels = getLimitedChannels(interaction.guild.id);
    const channelMentions = updatedLimitedChannels.length > 0 
      ? updatedLimitedChannels.map(id => `<#${id}>`).join(', ')
      : 'Ninguno';

    interaction.reply(`Canales restaurados. Los siguientes canales siguen sin ganar XP: ${channelMentions}`);
  },
};

