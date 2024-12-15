const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unlock',
  description: 'Desbloquea un canal',
  usage: 'c!unlock [#canal/id]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const channel = message.mentions.channels.first() || message.channel;

    await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null });
    message.reply(`El canal ${channel} ha sido desbloqueado.`);
  },
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Desbloquea un canal')
    .addChannelOption(option => 
      option.setName('canal')
        .setDescription('El canal para desbloquear')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('canal') || interaction.channel;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
    interaction.reply(`El canal ${channel} ha sido desbloqueado.`);
  },
};

