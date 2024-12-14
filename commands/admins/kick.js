const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Expulsa a un usuario del servidor',
  usage: 'k!kick <@usuario> [razón]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('No tienes permiso para expulsar usuarios.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Debes mencionar a un usuario para expulsar.');
    }

    const reason = args.slice(1).join(' ') || 'No se proporcionó una razón';

    try {
      await message.guild.members.kick(user, reason);
      message.reply(`${user.tag} ha sido expulsado. Razón: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply('Hubo un error al intentar expulsar al usuario.');
    }
  },
  data: {
    name: 'kick',
    description: 'Expulsa a un usuario del servidor',
    options: [
      {
        name: 'usuario',
        type: 6, // USER type
        description: 'El usuario que quieres expulsar',
        required: true,
      },
      {
        name: 'razon',
        type: 3, // STRING type
        description: 'La razón de la expulsión',
        required: false,
      },
    ],
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'No tienes permiso para expulsar usuarios.', ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon') || 'No se proporcionó una razón';

    try {
      await interaction.guild.members.kick(user, reason);
      interaction.reply(`${user.tag} ha sido expulsado. Razón: ${reason}`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Hubo un error al intentar expulsar al usuario.', ephemeral: true });
    }
  },
};
