const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { removeLevelMessageConfig } = require('../utils/experienceUtils');

module.exports = {
  name: 'levelmessageremove',
  aliases: ['levelmsgremove'],
  description: 'Elimina la configuración personalizada de mensajes de nivel',
  usage: 'k!levelmessageremove',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    removeLevelMessageConfig(message.guild.id);
    message.reply('La configuración personalizada de mensajes de nivel ha sido eliminada. Se usará el mensaje predeterminado.');
  },
  data: new SlashCommandBuilder()
    .setName('levelmessageremove')
    .setDescription('Elimina la configuración personalizada de mensajes de nivel'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    removeLevelMessageConfig(interaction.guild.id);
    interaction.reply('La configuración personalizada de mensajes de nivel ha sido eliminada. Se usará el mensaje predeterminado.');
  },
};
