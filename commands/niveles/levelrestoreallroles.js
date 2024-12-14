const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { clearLimitedRoles } = require('../../utils/experienceUtils');

module.exports = {
  name: 'levelrestoreallroles',
  description: 'Restaura la ganancia de XP para todos los roles',
  usage: 'c!levelrestoreallroles',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    clearLimitedRoles(message.guild.id);
    message.reply('Todos los roles han sido restaurados. Ahora se puede ganar XP con todos los roles.');
  },
  data: new SlashCommandBuilder()
    .setName('levelrestoreallroles')
    .setDescription('Restaura la ganancia de XP para todos los roles'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    clearLimitedRoles(interaction.guild.id);
    interaction.reply('Todos los roles han sido restaurados. Ahora se puede ganar XP con todos los roles.');
  },
};

