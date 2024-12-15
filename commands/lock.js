const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'lock',
  description: 'Bloquea un canal',
  usage: 'c!lock [#canal/id]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const channel = message.mentions.channels.first() || message.channel;

    await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
    message.reply(`El canal ${channel} ha sido bloqueado.`);
  },
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Bloquea un canal')
    .addChannelOption(option => 
      option.setName('canal')
        .setDescription('El canal para bloquear')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('canal') || interaction.channel;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    interaction.reply(`El canal ${channel} ha sido bloqueado.`);
  },
};

