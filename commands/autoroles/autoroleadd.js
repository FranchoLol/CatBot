const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const autoroleFile = path.join(__dirname, '..', '..', 'data', 'autoroles.json');

function getAutoroles() {
  if (!fs.existsSync(autoroleFile)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(autoroleFile, 'utf8'));
}

function saveAutoroles(autoroles) {
  fs.writeFileSync(autoroleFile, JSON.stringify(autoroles, null, 2));
}

module.exports = {
  name: 'autoroleadd',
  description: 'Añade roles automáticos para usuarios o bots',
  usage: 'c!autoroleadd [user/bot] [@rol1,@rol2,...]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    if (args.length < 2) {
      return message.reply('Uso correcto: c!autoroleadd [user/bot] [@rol1,@rol2,...]');
    }

    const type = args[0].toLowerCase();
    if (type !== 'user' && type !== 'bot') {
      return message.reply('El tipo debe ser "user" o "bot".');
    }

    const roles = message.mentions.roles;
    if (roles.size === 0) {
      return message.reply('Por favor, menciona al menos un rol.');
    }

    const autoroles = getAutoroles();
    if (!autoroles[message.guild.id]) {
      autoroles[message.guild.id] = { user: [], bot: [] };
    }

    roles.forEach(role => {
      if (!autoroles[message.guild.id][type].includes(role.id)) {
        autoroles[message.guild.id][type].push(role.id);
      }
    });

    saveAutoroles(autoroles);

    message.reply(`Roles automáticos para ${type === 'user' ? 'usuarios' : 'bots'} actualizados.`);
  },
  data: new SlashCommandBuilder()
    .setName('autoroleadd')
    .setDescription('Añade roles automáticos para usuarios o bots')
    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('Tipo de entidad (user/bot)')
        .setRequired(true)
        .addChoices(
          { name: 'Usuario', value: 'user' },
          { name: 'Bot', value: 'bot' }
        ))
    .addStringOption(option =>
      option.setName('roles')
        .setDescription('IDs de los roles separados por comas')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const type = interaction.options.getString('tipo');
    const rolesInput = interaction.options.getString('roles');
    const roleIds = rolesInput.split(',').map(id => id.trim());

    const autoroles = getAutoroles();
    if (!autoroles[interaction.guild.id]) {
      autoroles[interaction.guild.id] = { user: [], bot: [] };
    }

    roleIds.forEach(roleId => {
      if (!autoroles[interaction.guild.id][type].includes(roleId)) {
        autoroles[interaction.guild.id][type].push(roleId);
      }
    });

    saveAutoroles(autoroles);

    interaction.reply(`Roles automáticos para ${type === 'user' ? 'usuarios' : 'bots'} actualizados.`);
  },
};

