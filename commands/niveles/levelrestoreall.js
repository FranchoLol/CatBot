const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { clearLimitedChannels } = require('../../utils/experienceUtils');

module.exports = {
  name: 'levelrestoreall',
  description: 'Restaura la ganancia de XP en todos los canales',
  usage: 'c!levelrestoreall',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    clearLimitedChannels(message.guild.id);
    message.reply('Todos los canales han sido restaurados. Ahora se puede ganar XP en todos los canales.');
  },
  data: new SlashCommandBuilder()
    .setName('levelrestoreall')
    .setDescription('Restaura la ganancia de XP en todos los canales'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    clearLimitedChannels(interaction.guild.id);
    interaction.reply('Todos los canales han sido restaurados. Ahora se puede ganar XP en todos los canales.');
  },
};

