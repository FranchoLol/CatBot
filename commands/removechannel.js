const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'removechannel',
  description: 'Elimina un canal',
  usage: 'c!removechannel [#canal/id]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) {
      return message.reply('Por favor, menciona o proporciona la ID de un canal válido.');
    }

    try {
      await channel.delete();
      message.reply(`El canal ${channel.name} ha sido eliminado.`);
    } catch (error) {
      console.error(error);
      message.reply('Hubo un error al intentar eliminar el canal. Asegúrate de que tengo los permisos necesarios.');
    }
  },
  data: new SlashCommandBuilder()
    .setName('removechannel')
    .setDescription('Elimina un canal')
    .addChannelOption(option => 
      option.setName('canal')
        .setDescription('El canal a eliminar')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('canal');

    try {
      await channel.delete();
      interaction.reply(`El canal ${channel.name} ha sido eliminado.`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Hubo un error al intentar eliminar el canal. Asegúrate de que tengo los permisos necesarios.', ephemeral: true });
    }
  },
};

