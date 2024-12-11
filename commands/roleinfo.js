const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment');
moment.locale('es');

module.exports = {
  name: 'roleinfo',
  description: 'Muestra información detallada sobre un rol',
  usage: 'k!roleinfo <@rol|ID>',
  run: async (client, message, args) => {
    if (!args[0]) return message.reply('Por favor, menciona un rol o proporciona su ID.');

    let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);

    if (!role) return message.reply('No se pudo encontrar el rol especificado.');

    const embed = new EmbedBuilder()
      .setColor(role.color)
      .setTitle(`Información del Rol: ${role.name}`)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Nombre', value: role.name, inline: true },
        { name: 'Color', value: role.hexColor, inline: true },
        { name: 'Posición', value: `${role.position}/${message.guild.roles.cache.size}`, inline: true },
        { name: 'Mencionable', value: role.mentionable ? 'Sí' : 'No', inline: true },
        { name: 'Separado', value: role.hoist ? 'Sí' : 'No', inline: true },
        { name: 'Creado el', value: moment(role.createdAt).format('DD/MM/YYYY HH:mm:ss'), inline: true },
        { name: 'Miembros con este rol', value: role.members.size.toString(), inline: true }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
  data: {
    name: 'roleinfo',
    description: 'Muestra información detallada sobre un rol',
    options: [
      {
        name: 'rol',
        type: 8, // ROLE type
        description: 'El rol del que quieres obtener información',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const role = interaction.options.getRole('rol');

    const embed = new EmbedBuilder()
      .setColor(role.color)
      .setTitle(`Información del Rol: ${role.name}`)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Nombre', value: role.name, inline: true },
        { name: 'Color', value: role.hexColor, inline: true },
        { name: 'Posición', value: `${role.position}/${interaction.guild.roles.cache.size}`, inline: true },
        { name: 'Mencionable', value: role.mentionable ? 'Sí' : 'No', inline: true },
        { name: 'Separado', value: role.hoist ? 'Sí' : 'No', inline: true },
        { name: 'Creado el', value: moment(role.createdAt).format('DD/MM/YYYY HH:mm:ss'), inline: true },
        { name: 'Miembros con este rol', value: role.members.size.toString(), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

