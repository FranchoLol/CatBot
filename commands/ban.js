const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Banea a un usuario del servidor',
  usage: 'k!ban <@usuario> [razón]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('No tienes permiso para banear usuarios.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Debes mencionar a un usuario para banear.');
    }

    const reason = args.slice(1).join(' ') || 'No se proporcionó una razón';

    try {
      await message.guild.members.ban(user, { reason });
      message.reply(`${user.tag} ha sido baneado. Razón: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply('Hubo un error al intentar banear al usuario.');
    }
  },
  data: {
    name: 'ban',
    description: 'Banea a un usuario del servidor',
    options: [
      {
        name: 'usuario',
        type: 6, // USER type
        description: 'El usuario que quieres banear',
        required: true,
      },
      {
        name: 'razon',
        type: 3, // STRING type
        description: 'La razón del baneo',
        required: false,
      },
    ],
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'No tienes permiso para banear usuarios.', ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon') || 'No se proporcionó una razón';

    try {
      await interaction.guild.members.ban(user, { reason });
      interaction.reply(`${user.tag} ha sido baneado. Razón: ${reason}`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Hubo un error al intentar banear al usuario.', ephemeral: true });
    }
  },
};
