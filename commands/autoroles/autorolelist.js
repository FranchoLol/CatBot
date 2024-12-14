const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const autoroleFile = path.join(__dirname, '..', '..', 'data', 'autoroles.json');

function getAutoroles() {
  if (!fs.existsSync(autoroleFile)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(autoroleFile, 'utf8'));
}

module.exports = {
  name: 'autorolelist',
  description: 'Muestra la lista de roles automáticos para usuarios y bots',
  usage: 'c!autorolelist',
  run: async (client, message, args) => {
    const autoroles = getAutoroles();
    const guildAutoroles = autoroles[message.guild.id] || { user: [], bot: [] };

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Roles Automáticos')
      .addFields(
        { name: 'Usuarios', value: formatRoleList(message.guild, guildAutoroles.user) },
        { name: 'Bots', value: formatRoleList(message.guild, guildAutoroles.bot) }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('autorolelist')
    .setDescription('Muestra la lista de roles automáticos para usuarios y bots'),
  async execute(interaction) {
    const autoroles = getAutoroles();
    const guildAutoroles = autoroles[interaction.guild.id] || { user: [], bot: [] };

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Roles Automáticos')
      .addFields(
        { name: 'Usuarios', value: formatRoleList(interaction.guild, guildAutoroles.user) },
        { name: 'Bots', value: formatRoleList(interaction.guild, guildAutoroles.bot) }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};

function formatRoleList(guild, roleIds) {
  if (roleIds.length === 0) {
    return 'No hay roles automáticos configurados.';
  }

  return roleIds.map(roleId => {
    const role = guild.roles.cache.get(roleId);
    return role ? `- ${role.name} (${roleId})` : `- Rol desconocido (${roleId})`;
  }).join('\n');
}

