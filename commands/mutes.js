const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms');

const mutesFile = path.join(__dirname, '..', 'data', 'mutes.json');

function getMutes() {
  if (!fs.existsSync(mutesFile)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(mutesFile, 'utf8'));
}

module.exports = {
  name: 'mutes',
  description: 'Muestra la lista de usuarios silenciados',
  usage: 'c!mutes',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('No tienes permiso para ver la lista de usuarios silenciados.');
    }

    const mutes = getMutes();
    const guildMutes = mutes[message.guild.id] || {};

    if (Object.keys(guildMutes).length === 0) {
      return message.reply('No hay usuarios silenciados en este servidor.');
    }

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Usuarios Silenciados')
      .setDescription('Lista de usuarios actualmente silenciados:')
      .setTimestamp();

    for (const [userId, muteInfo] of Object.entries(guildMutes)) {
      const user = await client.users.fetch(userId).catch(() => null);
      if (user) {
        const moderator = await client.users.fetch(muteInfo.moderator).catch(() => null);
        const remainingTime = muteInfo.duration ? ms(muteInfo.startTime + muteInfo.duration - Date.now(), { long: true }) : 'Indefinido';
        embed.addFields({
          name: user.tag,
          value: `Razón: ${muteInfo.reason}
Moderador: ${moderator ? moderator.tag : 'Desconocido'}
Tiempo restante: ${remainingTime}
Fecha de inicio: ${new Date(muteInfo.startTime).toLocaleString()}`
        });
      }
    }

    message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('mutes')
    .setDescription('Muestra la lista de usuarios silenciados'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'No tienes permiso para ver la lista de usuarios silenciados.', ephemeral: true });
    }

    const mutes = getMutes();
    const guildMutes = mutes[interaction.guild.id] || {};

    if (Object.keys(guildMutes).length === 0) {
      return interaction.reply('No hay usuarios silenciados en este servidor.');
    }

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Usuarios Silenciados')
      .setDescription('Lista de usuarios actualmente silenciados:')
      .setTimestamp();

    for (const [userId, muteInfo] of Object.entries(guildMutes)) {
      const user = await interaction.client.users.fetch(userId).catch(() => null);
      if (user) {
        const moderator = await interaction.client.users.fetch(muteInfo.moderator).catch(() => null);
        const remainingTime = muteInfo.duration ? ms(muteInfo.startTime + muteInfo.duration - Date.now(), { long: true }) : 'Indefinido';
        embed.addFields({
          name: user.tag,
          value: `Razón: ${muteInfo.reason}
Moderador: ${moderator ? moderator.tag : 'Desconocido'}
Tiempo restante: ${remainingTime}
Fecha de inicio: ${new Date(muteInfo.startTime).toLocaleString()}`
        });
      }
    }

    interaction.reply({ embeds: [embed] });
  },
};

