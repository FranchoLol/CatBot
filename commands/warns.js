const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warnsPath = path.join(__dirname, '..', 'data', 'warns.json');

function getWarns() {
  if (!fs.existsSync(warnsPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
}

module.exports = {
  name: 'warns',
  description: 'Muestra la lista de advertencias de un usuario',
  usage: 'c!warns [@usuario/id]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('No tienes permiso para ver las advertencias de los usuarios.');
    }

    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) {
      return message.reply('Por favor, menciona a un usuario o proporciona su ID.');
    }

    const warns = getWarns();
    const userWarns = warns[message.guild.id]?.[user.id] || [];

    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle(`Advertencias de ${user.tag}`)
      .setDescription(userWarns.length === 0 ? 'Este usuario no tiene advertencias.' : '')
      .setFooter({ text: `ID del usuario: ${user.id}` });

    userWarns.forEach((warn, index) => {
      const moderator = client.users.cache.get(warn.moderator);
      const moderatorName = moderator ? moderator.tag : 'Moderador desconocido';
      const endDate = warn.endDate ? new Date(warn.endDate).toLocaleString() : 'No especificada';
      
      embed.addFields({
        name: `Advertencia ${index + 1}`,
        value: `**Razón:** ${warn.reason}\n**Fecha:** ${new Date(warn.date).toLocaleString()}\n**Fecha de fin:** ${endDate}\n**Moderador:** ${moderatorName}`
      });
    });

    message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('Muestra la lista de advertencias de un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario del que quieres ver las advertencias')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'No tienes permiso para ver las advertencias de los usuarios.', ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const warns = getWarns();
    const userWarns = warns[interaction.guild.id]?.[user.id] || [];

    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle(`Advertencias de ${user.tag}`)
      .setDescription(userWarns.length === 0 ? 'Este usuario no tiene advertencias.' : '')
      .setFooter({ text: `ID del usuario: ${user.id}` });

    userWarns.forEach((warn, index) => {
      const moderator = interaction.client.users.cache.get(warn.moderator);
      const moderatorName = moderator ? moderator.tag : 'Moderador desconocido';
      const endDate = warn.endDate ? new Date(warn.endDate).toLocaleString() : 'No especificada';
      
      embed.addFields({
        name: `Advertencia ${index + 1}`,
        value: `**Razón:** ${warn.reason}\n**Fecha:** ${new Date(warn.date).toLocaleString()}\n**Fecha de fin:** ${endDate}\n**Moderador:** ${moderatorName}`
      });
    });

    interaction.reply({ embeds: [embed] });
  },
};

