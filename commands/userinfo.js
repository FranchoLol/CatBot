const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
const { SlashCommandBuilder } = require('discord.js');
moment.locale('es');

module.exports = {
  name: 'userinfo',
  description: 'Muestra información detallada sobre un usuario',
  usage: 'k!userinfo [@usuario|ID]',
  run: async (client, message, args) => {
    let user;
    if (args[0]) {
      user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    } else {
      user = message.author;
    }

    if (!user) {
      return message.reply('No se pudo encontrar al usuario especificado.');
    }

    const member = message.guild.members.cache.get(user.id);
    const accountAge = moment(user.createdAt).fromNow(true);
    const joinedAt = member ? moment(member.joinedAt).fromNow(true) : 'No está en el servidor';

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Información de Usuario: ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Apodo', value: member?.nickname || 'Ninguno', inline: true },
        { name: 'Cuenta creada', value: `${user.createdAt.toLocaleDateString()} (${accountAge})`, inline: true },
        { name: 'Se unió al servidor', value: member ? `${member.joinedAt.toLocaleDateString()} (${joinedAt})` : 'No está en el servidor', inline: true },
        { name: 'Roles', value: member ? member.roles.cache.map(role => role.name).join(', ') : 'No está en el servidor' },
        { name: 'Es bot', value: user.bot ? 'Sí' : 'No', inline: true },
        { name: 'Insignias', value: user.flags ? user.flags.toArray().join(', ') : 'Ninguna', inline: true }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
  data: {
    name: 'userinfo',
    description: 'Muestra información detallada sobre un usuario',
    options: [
      {
        name: 'usuario',
        type: 6, // USER type
        description: 'El usuario del que quieres obtener información (mención o ID)',
        required: false,
      },
    ],
  },
  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const accountAge = moment(user.createdAt).fromNow(true);
    const joinedAt = member ? moment(member.joinedAt).fromNow(true) : 'No está en el servidor';

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Información de Usuario: ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Apodo', value: member?.nickname || 'Ninguno', inline: true },
        { name: 'Cuenta creada', value: `${user.createdAt.toLocaleDateString()} (${accountAge})`, inline: true },
        { name: 'Se unió al servidor', value: member ? `${member.joinedAt.toLocaleDateString()} (${joinedAt})` : 'No está en el servidor', inline: true },
        { name: 'Roles', value: member ? member.roles.cache.map(role => role.name).join(', ') : 'No está en el servidor' },
        { name: 'Es bot', value: user.bot ? 'Sí' : 'No', inline: true },
        { name: 'Insignias', value: user.flags ? user.flags.toArray().join(', ') : 'Ninguna', inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
