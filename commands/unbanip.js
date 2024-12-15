const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unbanip',
  description: 'Desbanea la IP de un usuario',
  usage: 'c!unbanip <ID del usuario>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('No tienes permiso para desbanear IPs de usuarios.');
    }

    if (!args[0]) {
      return message.reply('Por favor, proporciona la ID del usuario cuya IP quieres desbanear.');
    }

    const userId = args[0];

    try {
      const bans = await message.guild.bans.fetch();
      const bannedUser = bans.find(ban => ban.user.id === userId);

      if (!bannedUser) {
        return message.reply('No se encontró ningún usuario baneado con esa ID.');
      }

      await message.guild.members.unban(userId);
      message.reply(`La IP del usuario con ID ${userId} ha sido desbaneada.`);
    } catch (error) {
      console.error('Error al desbanear la IP del usuario:', error);
      message.reply('Hubo un error al intentar desbanear la IP del usuario. Asegúrate de que la ID sea válida y que el usuario esté baneado.');
    }
  },
  data: new SlashCommandBuilder()
    .setName('unbanip')
    .setDescription('Desbanea la IP de un usuario')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('ID del usuario cuya IP quieres desbanear')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'No tienes permiso para desbanear IPs de usuarios.', ephemeral: true });
    }

    const userId = interaction.options.getString('userid');

    try {
      const bans = await interaction.guild.bans.fetch();
      const bannedUser = bans.find(ban => ban.user.id === userId);

      if (!bannedUser) {
        return interaction.reply({ content: 'No se encontró ningún usuario baneado con esa ID.', ephemeral: true });
      }

      await interaction.guild.members.unban(userId);
      interaction.reply(`La IP del usuario con ID ${userId} ha sido desbaneada.`);
    } catch (error) {
      console.error('Error al desbanear la IP del usuario:', error);
      interaction.reply({ content: 'Hubo un error al intentar desbanear la IP del usuario. Asegúrate de que la ID sea válida y que el usuario esté baneado.', ephemeral: true });
    }
  },
};

