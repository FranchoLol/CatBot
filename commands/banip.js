const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'banip',
  description: 'Banea la IP de uno o varios usuarios del servidor',
  usage: 'c!banip <@usuario1> [@usuario2] [...] [razón]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('No tienes permiso para banear usuarios.');
    }

    const users = message.mentions.users;
    if (users.size === 0) {
      return message.reply('Debes mencionar al menos a un usuario para banear su IP.');
    }

    const reason = args.slice(users.size).join(' ') || 'No se proporcionó una razón';

    let bannedUsers = [];
    let failedBans = [];

    for (const [, user] of users) {
      try {
        await message.guild.members.ban(user, { reason, days: 7 });
        bannedUsers.push(user.tag);
      } catch (error) {
        failedBans.push(user.tag);
        console.error(`Error al banear la IP de ${user.tag}:`, error);
      }
    }

    let response = '';
    if (bannedUsers.length > 0) {
      response += `IPs baneadas de los usuarios: ${bannedUsers.join(', ')}\n`;
    }
    if (failedBans.length > 0) {
      response += `No se pudo banear la IP de: ${failedBans.join(', ')}`;
    }

    message.reply(response);
  },
  data: new SlashCommandBuilder()
    .setName('banip')
    .setDescription('Banea la IP de uno o varios usuarios del servidor')
    .addStringOption(option =>
      option.setName('usuarios')
        .setDescription('Los usuarios a banear (IDs o menciones, separados por espacios)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('La razón del baneo de IP')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'No tienes permiso para banear usuarios.', ephemeral: true });
    }

    const userInput = interaction.options.getString('usuarios');
    const reason = interaction.options.getString('razon') || 'No se proporcionó una razón';

    const userIds = userInput.split(/\s+/).map(id => id.replace(/[<@!>]/g, ''));

    let bannedUsers = [];
    let failedBans = [];

    for (const userId of userIds) {
      try {
        const user = await interaction.client.users.fetch(userId);
        await interaction.guild.members.ban(user, { reason, days: 7 });
        bannedUsers.push(user.tag);
      } catch (error) {
        failedBans.push(userId);
        console.error(`Error al banear la IP del usuario con ID ${userId}:`, error);
      }
    }

    let response = '';
    if (bannedUsers.length > 0) {
      response += `IPs baneadas de los usuarios: ${bannedUsers.join(', ')}\n`;
    }
    if (failedBans.length > 0) {
      response += `No se pudo banear la IP de: ${failedBans.join(', ')}`;
    }

    interaction.reply(response);
  },
};
