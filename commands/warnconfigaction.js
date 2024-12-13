const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warnConfigPath = path.join(__dirname, '..', 'data', 'warnConfig.json');

function getWarnConfig() {
  if (!fs.existsSync(warnConfigPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(warnConfigPath, 'utf8'));
}

function saveWarnConfig(config) {
  fs.writeFileSync(warnConfigPath, JSON.stringify(config, null, 2), 'utf8');
}

module.exports = {
  name: 'warnconfigaction',
  description: 'Establece la acción a tomar cuando se alcanza el máximo de advertencias',
  usage: 'c!warnconfigaction <banip/ban/kick/@rol1 @rol2...>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    if (args.length === 0) {
      return message.reply('Por favor, especifica una acción (banip, ban, kick) o menciona uno o más roles.');
    }

    const config = getWarnConfig();
    if (!config[message.guild.id]) config[message.guild.id] = {};

    const action = args[0].toLowerCase();
    if (['banip', 'ban', 'kick'].includes(action)) {
      config[message.guild.id].action = action;
    } else {
      const roles = message.mentions.roles;
      if (roles.size === 0) {
        return message.reply('Por favor, especifica una acción válida o menciona uno o más roles.');
      }
      config[message.guild.id].action = 'roles';
      config[message.guild.id].actionRoles = roles.map(role => role.id);
    }

    saveWarnConfig(config);

    let response = `La acción para el máximo de advertencias se ha establecido en: ${config[message.guild.id].action}`;
    if (config[message.guild.id].action === 'roles') {
      response += `\nRoles: ${config[message.guild.id].actionRoles.map(id => `<@&${id}>`).join(', ')}`;
    }
    message.reply(response);
  },
  data: new SlashCommandBuilder()
    .setName('warnconfigaction')
    .setDescription('Establece la acción a tomar cuando se alcanza el máximo de advertencias')
    .addStringOption(option =>
      option.setName('accion')
        .setDescription('La acción a tomar (banip, ban, kick, o "roles" para asignar roles)')
        .setRequired(true)
        .addChoices(
          { name: 'Ban IP', value: 'banip' },
          { name: 'Ban', value: 'ban' },
          { name: 'Kick', value: 'kick' },
          { name: 'Asignar Roles', value: 'roles' }
        ))
    .addStringOption(option =>
      option.setName('roles')
        .setDescription('IDs de los roles a asignar, separados por espacios (solo si se elige "roles")')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const action = interaction.options.getString('accion');
    const config = getWarnConfig();
    if (!config[interaction.guild.id]) config[interaction.guild.id] = {};

    if (action === 'roles') {
      const rolesInput = interaction.options.getString('roles');
      if (!rolesInput) {
        return interaction.reply({ content: 'Por favor, proporciona los IDs de los roles a asignar.', ephemeral: true });
      }
      const roleIds = rolesInput.split(/\s+/);
      config[interaction.guild.id].action = 'roles';
      config[interaction.guild.id].actionRoles = roleIds;
    } else {
      config[interaction.guild.id].action = action;
    }

    saveWarnConfig(config);

    let response = `La acción para el máximo de advertencias se ha establecido en: ${config[interaction.guild.id].action}`;
    if (config[interaction.guild.id].action === 'roles') {
      response += `\nRoles: ${config[interaction.guild.id].actionRoles.map(id => `<@&${id}>`).join(', ')}`;
    }
    interaction.reply(response);
  },
};

