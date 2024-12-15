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
  description: 'Muestra la lista de advertencias de todos los usuarios',
  usage: 'c!warns',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('No tienes permiso para ver las advertencias de los usuarios.');
    }

    const warns = getWarns();
    const guildWarns = warns[message.guild.id] || {};

    if (Object.keys(guildWarns).length === 0) {
      return message.reply('No hay advertencias registradas en este servidor.');
    }

    let warnList = '';
    for (const [userId, userWarns] of Object.entries(guildWarns)) {
      const user = await client.users.fetch(userId).catch(() => null);
      if (user) {
        warnList += `@${user.tag} - ${user.id} | ${userWarns.length} warns\n`;
        userWarns.forEach((warn, index) => {
          const date = new Date(warn.date).toLocaleString();
          warnList += `    warn${index + 1} | ${date} | ${warn.reason}\n`;
        });
        warnList += '\n';
      }
    }

    if (warnList.length > 2000) {
      const chunks = warnList.match(/.{1,2000}/g);
      for (const chunk of chunks) {
        await message.channel.send(chunk);
      }
    } else {
      message.reply(warnList);
    }
  },
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('Muestra la lista de advertencias de todos los usuarios'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'No tienes permiso para ver las advertencias de los usuarios.', ephemeral: true });
    }

    const warns = getWarns();
    const guildWarns = warns[interaction.guild.id] || {};

    if (Object.keys(guildWarns).length === 0) {
      return interaction.reply('No hay advertencias registradas en este servidor.');
    }

    let warnList = '';
    for (const [userId, userWarns] of Object.entries(guildWarns)) {
      const user = await interaction.client.users.fetch(userId).catch(() => null);
      if (user) {
        warnList += `@${user.tag} - ${user.id} | ${userWarns.length} warns\n`;
        userWarns.forEach((warn, index) => {
          const date = new Date(warn.date).toLocaleString();
          warnList += `    warn${index + 1} | ${date} | ${warn.reason}\n`;
        });
        warnList += '\n';
      }
    }

    if (warnList.length > 2000) {
      await interaction.reply('La lista de advertencias es muy larga. Se enviará en varios mensajes.');
      const chunks = warnList.match(/.{1,2000}/g);
      for (const chunk of chunks) {
        await interaction.channel.send(chunk);
      }
    } else {
      interaction.reply(warnList);
    }
  },
};

