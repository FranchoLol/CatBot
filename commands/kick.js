const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'kick',
  description: 'Expulsa a un usuario del servidor',
  usage: 'k!kick <@usuario> [razón]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('No tienes permiso para expulsar usuarios.');
    }

    if (!message.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('No tengo permiso para expulsar usuarios.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Debes mencionar a un usuario para expulsar.');
    }

    const member = message.guild.members.cache.get(user.id);
    if (!member.kickable) {
      return message.reply('No puedo expulsar a este usuario. Puede que tenga un rol más alto que el mío o que yo no tenga permisos para expulsarlo.');
    }

    const reason = args.slice(1).join(' ') || 'No se proporcionó una razón';

    try {
      await member.kick(reason);
      message.reply(`${user.tag} ha sido expulsado. Razón: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply('Hubo un error al intentar expulsar al usuario.');
    }
  },
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un usuario del servidor')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario que quieres expulsar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('La razón de la expulsión')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'No tienes permiso para expulsar usuarios.', ephemeral: true });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'No tengo permiso para expulsar usuarios.', ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const member = interaction.guild.members.cache.get(user.id);
    if (!member.kickable) {
      return interaction.reply({ content: 'No puedo expulsar a este usuario. Puede que tenga un rol más alto que el mío o que yo no tenga permisos para expulsarlo.', ephemeral: true });
    }

    const reason = interaction.options.getString('razon') || 'No se proporcionó una razón';

    try {
      await member.kick(reason);
      interaction.reply(`${user.tag} ha sido expulsado. Razón: ${reason}`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Hubo un error al intentar expulsar al usuario.', ephemeral: true });
    }
  },
};

