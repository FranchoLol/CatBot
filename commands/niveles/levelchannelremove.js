const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { removeLevelChannelConfig } = require('../../utils/experienceUtils');

module.exports = {
  name: 'levelchannelremove',
  description: 'Elimina la configuración de canal para anuncios de subida de nivel',
  usage: 'k!levelchannelremove',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    removeLevelChannelConfig(message.guild.id);
    message.reply('La configuración de canal para anuncios de subida de nivel ha sido eliminada. Se usará el canal predeterminado.');
  },
  data: new SlashCommandBuilder()
    .setName('levelchannelremove')
    .setDescription('Elimina la configuración de canal para anuncios de subida de nivel'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    removeLevelChannelConfig(interaction.guild.id);
    interaction.reply('La configuración de canal para anuncios de subida de nivel ha sido eliminada. Se usará el canal predeterminado.');
  },
};

