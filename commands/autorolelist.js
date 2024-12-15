const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const autoroleFile = path.join(__dirname, '..', 'data', 'autoroles.json');

async function getAutoroles() {
  try {
    const data = await fs.readFile(autoroleFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

module.exports = {
  name: 'autorolelist',
  description: 'Muestra la lista de roles automáticos para usuarios y bots',
  usage: 'c!autorolelist',
  run: async (client, message, args) => {
    const autoroles = await getAutoroles();
    const guildAutoroles = autoroles[message.guild.id] || { user: [], bot: [] };

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Roles Automáticos')
      .addFields(
        { name: 'Usuarios', value: formatRoleList(message.guild, guildAutoroles.user) || 'No hay roles automáticos configurados.' },
        { name: 'Bots', value: formatRoleList(message.guild, guildAutoroles.bot) || 'No hay roles automáticos configurados.' }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('autorolelist')
    .setDescription('Muestra la lista de roles automáticos para usuarios y bots'),
  async execute(interaction) {
    const autoroles = await getAutoroles();
    const guildAutoroles = autoroles[interaction.guild.id] || { user: [], bot: [] };

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Roles Automáticos')
      .addFields(
        { name: 'Usuarios', value: formatRoleList(interaction.guild, guildAutoroles.user) || 'No hay roles automáticos configurados.' },
        { name: 'Bots', value: formatRoleList(interaction.guild, guildAutoroles.bot) || 'No hay roles automáticos configurados.' }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};

function formatRoleList(guild, roleIds) {
  if (roleIds.length === 0) {
    return null;
  }

  return roleIds.map(roleId => {
    const role = guild.roles.cache.get(roleId);
    return role ? `@${role.name} (${roleId})` : `Rol desconocido (${roleId})`;
  }).join('\n');
}

