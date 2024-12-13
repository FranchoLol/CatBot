const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warnConfigPath = path.join(__dirname, '..', 'data', 'warnConfig.json');

function getWarnConfig(guildId) {
  if (!fs.existsSync(warnConfigPath)) {
    return { maxWarns: 3, action: 'kick' };
  }
  const config = JSON.parse(fs.readFileSync(warnConfigPath, 'utf8'));
  return config[guildId] || { maxWarns: 3, action: 'kick' };
}

function saveWarnConfig(guildId, config) {
  let allConfig = {};
  if (fs.existsSync(warnConfigPath)) {
    allConfig = JSON.parse(fs.readFileSync(warnConfigPath, 'utf8'));
  }
  allConfig[guildId] = config;
  fs.writeFileSync(warnConfigPath, JSON.stringify(allConfig, null, 2), 'utf8');
}

module.exports = {
  name: 'warnconfig',
  description: 'Configura el sistema de advertencias',
  usage: 'c!warnconfig [maxwarns número] [action kick/ban/banip/rol @rol]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('No tienes permiso para configurar el sistema de advertencias.');
    }

    const config = getWarnConfig(message.guild.id);

    if (args.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Configuración de Advertencias')
        .addFields(
          { name: 'Máximo de advertencias', value: config.maxWarns.toString() },
          { name: 'Acción', value: config.action }
        );
      return message.reply({ embeds: [embed] });
    }

    const option = args[0].toLowerCase();
    const value = args.slice(1).join(' ');

    switch (option) {
      case 'maxwarns':
        const maxWarns = parseInt(value);
        if (isNaN(maxWarns) || maxWarns < 1) {
          return message.reply('Por favor, proporciona un número válido para el máximo de advertencias.');
        }
        config.maxWarns = maxWarns;
        break;
      case 'action':
        const validActions = ['kick', 'ban', 'banip', 'rol'];
        const action = value.split(' ')[0].toLowerCase();
        if (!validActions.includes(action)) {
          return message.reply('La acción debe ser kick, ban, banip o rol.');
        }
        config.action = action;
        if (action === 'rol') {
          const role = message.mentions.roles.first();
          if (!role) {
            return message.reply('Por favor, menciona un rol válido para la acción de rol.');
          }
          config.actionRole = role.id;
        }
        break;
      default:
        return message.reply('Opción inválida. Usa maxwarns o action.');
    }

    saveWarnConfig(message.guild.id, config);
    message.reply('Configuración de advertencias actualizada.');
  },
  data: new SlashCommandBuilder()
    .setName('warnconfig')
    .setDescription('Configura el sistema de advertencias')
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('Ver la configuración actual'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('maxwarns')
        .setDescription('Establece el máximo de advertencias')
        .addIntegerOption(option =>
          option.setName('numero')
            .setDescription('El número máximo de advertencias')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('action')
        .setDescription('Establece la acción a tomar cuando se alcanza el máximo de advertencias')
        .addStringOption(option =>
          option.setName('tipo')
            .setDescription('El tipo de acción')
            .setRequired(true)
            .addChoices(
              { name: 'Expulsar', value: 'kick' },
              { name: 'Banear', value: 'ban' },
              { name: 'Banear IP', value: 'banip' },
              { name: 'Asignar Rol', value: 'rol' }
            ))
        .addRoleOption(option =>
          option.setName('rol')
            .setDescription('El rol a asignar (solo si se elige la acción "rol")')
            .setRequired(false))),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'No tienes permiso para configurar el sistema de advertencias.', ephemeral: true });
    }

    const config = getWarnConfig(interaction.guild.id);
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'view':
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Configuración de Advertencias')
          .addFields(
            { name: 'Máximo de advertencias', value: config.maxWarns.toString() },
            { name: 'Acción', value: config.action }
          );
        return interaction.reply({ embeds: [embed] });
      case 'maxwarns':
        const maxWarns = interaction.options.getInteger('numero');
        if (maxWarns < 1) {
          return interaction.reply({ content: 'El máximo de advertencias debe ser al menos 1.', ephemeral: true });
        }
        config.maxWarns = maxWarns;
        break;
      case 'action':
        const action = interaction.options.getString('tipo');
        config.action = action;
        if (action === 'rol') {
          const role = interaction.options.getRole('rol');
          if (!role) {
            return interaction.reply({ content: 'Debes proporcionar un rol para la acción de asignar rol.', ephemeral: true });
          }
          config.actionRole = role.id;
        }
        break;
    }

    saveWarnConfig(interaction.guild.id, config);
    interaction.reply('Configuración de advertencias actualizada.');
  },
};

