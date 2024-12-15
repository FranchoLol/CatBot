const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getLevelConfig, saveLevelConfig, getLimitedChannels, getLimitedRoles } = require('../utils/experienceUtils');

module.exports = {
  name: 'levelconfig',
  description: 'Configura el sistema de niveles',
  usage: 'c!levelconfig [opción] [valor]',
  run: async (client, message, args, lang) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply(getResponse(lang, 'noPermission'));
    }

    const config = getLevelConfig();
    const limitedChannels = getLimitedChannels(message.guild.id);
    const limitedRoles = getLimitedRoles(message.guild.id);

    if (args.length === 0) {
      // Mostrar la configuración actual
      const embed = createConfigEmbed(config, limitedChannels, limitedRoles, message.guild, lang);
      return message.reply({ embeds: [embed] });
    }

    const option = args[0].toLowerCase();
    const value = args.slice(1).join(' ');

    switch (option) {
      case 'xpcommandcooldown':
        const cooldown = parseInt(value);
        if (isNaN(cooldown) || cooldown < 0) {
          return message.reply(getResponse(lang, 'invalidCooldown'));
        }
        config.xpCommandCooldown = cooldown * 60 * 60 * 1000; // Convert hours to milliseconds
        break;
      default:
        return message.reply(getResponse(lang, 'invalidOption'));
    }

    saveLevelConfig(config);
    const embed = createConfigEmbed(config, limitedChannels, limitedRoles, message.guild, lang);
    return message.reply({ content: getResponse(lang, 'configUpdated'), embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('levelconfig')
    .setDescription('Configura el sistema de niveles')
    .addStringOption(option =>
      option.setName('option')
        .setDescription('Opción a configurar')
        .setRequired(true)
        .addChoices(
          { name: 'XP Command Cooldown', value: 'xpcommandcooldown' }
        ))
    .addStringOption(option =>
      option.setName('value')
        .setDescription('Valor de la configuración')
        .setRequired(true)),
  async execute(interaction, lang) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: getResponse(lang, 'noPermission'), ephemeral: true });
    }

    const config = getLevelConfig();
    const limitedChannels = getLimitedChannels(interaction.guild.id);
    const limitedRoles = getLimitedRoles(interaction.guild.id);
    const option = interaction.options.getString('option');
    const value = interaction.options.getString('value');

    switch (option) {
      case 'xpcommandcooldown':
        const cooldown = parseInt(value);
        if (isNaN(cooldown) || cooldown < 0) {
          return interaction.reply({ content: getResponse(lang, 'invalidCooldown'), ephemeral: true });
        }
        config.xpCommandCooldown = cooldown * 60 * 60 * 1000; // Convert hours to milliseconds
        break;
      default:
        return interaction.reply({ content: getResponse(lang, 'invalidOption'), ephemeral: true });
    }

    saveLevelConfig(config);
    const embed = createConfigEmbed(config, limitedChannels, limitedRoles, interaction.guild, lang);
    return interaction.reply({ content: getResponse(lang, 'configUpdated'), embeds: [embed] });
  },
};

function createConfigEmbed(config, limitedChannels, limitedRoles, guild, lang) {
  return new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(getResponse(lang, 'configTitle'))
    .addFields(
      { name: getResponse(lang, 'xpCommandCooldown'), value: `${config.xpCommandCooldown / (60 * 60 * 1000)} ${getResponse(lang, 'hours')}` },
      { name: getResponse(lang, 'limitedChannels'), value: limitedChannels.length > 0 ? 
        limitedChannels.map(channelId => `<#${channelId}>`).join(', ') : 
        getResponse(lang, 'noLimitedChannels') },
      { name: getResponse(lang, 'limitedRoles'), value: limitedRoles.length > 0 ? 
        limitedRoles.map(roleId => `<@&${roleId}>`).join(', ') : 
        getResponse(lang, 'noLimitedRoles') }
    );
}

function getResponse(lang, key, ...args) {
  const responses = {
    es: {
      noPermission: 'No tienes permiso para configurar el sistema de niveles.',
      invalidCooldown: 'El tiempo de espera debe ser un número positivo.',
      invalidOption: 'Opción inválida. Usa xpcommandcooldown.',
      configUpdated: 'Configuración actualizada con éxito.',
      configTitle: '⚙️ Configuración del Sistema de Niveles',
      xpCommandCooldown: 'Tiempo de espera del comando XP',
      hours: 'horas',
      limitedChannels: 'Canales limitados',
      noLimitedChannels: 'No hay canales limitados',
      configFooter: 'Usa c!levelconfig [opción] [valor] para modificar la configuración.',
      limitedRoles: 'Roles limitados',
      noLimitedRoles: 'No hay roles limitados'
    },
    en: {
      noPermission: 'You don\'t have permission to configure the level system.',
      invalidCooldown: 'Cooldown must be a positive number.',
      invalidOption: 'Invalid option. Use xpcommandcooldown.',
      configUpdated: 'Configuration updated successfully.',
      configTitle: '⚙️ Level System Configuration',
      xpCommandCooldown: 'XP Command Cooldown',
      hours: 'hours',
      limitedChannels: 'Limited Channels',
      noLimitedChannels: 'No limited channels',
      configFooter: 'Use c!levelconfig [option] [value] to modify the configuration.',
      limitedRoles: 'Limited Roles',
      noLimitedRoles: 'No limited roles'
    },
    pt: {
      noPermission: 'Você não tem permissão para configurar o sistema de níveis.',
      invalidCooldown: 'O tempo de espera deve ser um número positivo.',
      invalidOption: 'Opção inválida. Use xpcommandcooldown.',
      configUpdated: 'Configuração atualizada com sucesso.',
      configTitle: '⚙️ Configuração do Sistema de Níveis',
      xpCommandCooldown: 'Tempo de espera do comando XP',
      hours: 'horas',
      limitedChannels: 'Canais limitados',
      noLimitedChannels: 'Não há canais limitados',
      configFooter: 'Use c!levelconfig [opção] [valor] para modificar a configuração.',
      limitedRoles: 'Papéis limitados',
      noLimitedRoles: 'Não há papéis limitados'
    }
  };

  let message = responses[lang][key] || responses['en'][key];
  for (let i = 0; i < args.length; i++) {
    message = message.replace('%s', args[i]);
  }
  return message;
}

