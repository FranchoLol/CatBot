const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'nickname',
  description: 'Cambia el apodo de un usuario',
  usage: 'c!nickname [@usuario/id] <nuevo apodo>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply('Por favor, menciona o proporciona la ID de un usuario válido.');
    }

    const newNickname = args.slice(1).join(' ');
    if (!newNickname) {
      return message.reply('Por favor, proporciona un nuevo apodo.');
    }

    try {
      await target.setNickname(newNickname);
      message.reply(`El apodo de ${target.user.tag} ha sido cambiado a "${newNickname}".`);
    } catch (error) {
      console.error(error);
      message.reply('Hubo un error al intentar cambiar el apodo. Asegúrate de que tengo los permisos necesarios.');
    }
  },
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Cambia el apodo de un usuario')
    .addUserOption(option => 
      option.setName('usuario')
        .setDescription('El usuario al que cambiar el apodo')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('apodo')
        .setDescription('El nuevo apodo')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const target = interaction.options.getMember('usuario');
    const newNickname = interaction.options.getString('apodo');

    try {
      await target.setNickname(newNickname);
      interaction.reply(`El apodo de ${target.user.tag} ha sido cambiado a "${newNickname}".`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Hubo un error al intentar cambiar el apodo. Asegúrate de que tengo los permisos necesarios.', ephemeral: true });
    }
  },
};

