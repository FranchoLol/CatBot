const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unban',
  description: 'Desbanea a un usuario',
  usage: 'c!unban <ID del usuario>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('No tienes permiso para desbanear usuarios.');
    }

    if (!args[0]) {
      return message.reply('Por favor, proporciona la ID del usuario a desbanear.');
    }

    const userId = args[0];

    try {
      await message.guild.members.unban(userId);
      message.reply(`El usuario con ID ${userId} ha sido desbaneado.`);
    } catch (error) {
      console.error('Error al desbanear al usuario:', error);
      message.reply('Hubo un error al intentar desbanear al usuario. Asegúrate de que la ID sea válida y que el usuario esté baneado.');
    }
  },
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Desbanea a un usuario')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('ID del usuario a desbanear')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'No tienes permiso para desbanear usuarios.', ephemeral: true });
    }

    const userId = interaction.options.getString('userid');

    try {
      await interaction.guild.members.unban(userId);
      interaction.reply(`El usuario con ID ${userId} ha sido desbaneado.`);
    } catch (error) {
      console.error('Error al desbanear al usuario:', error);
      interaction.reply({ content: 'Hubo un error al intentar desbanear al usuario. Asegúrate de que la ID sea válida y que el usuario esté baneado.', ephemeral: true });
    }
  },
};

