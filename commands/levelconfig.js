const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getLevelConfig, saveLevelConfig } = require('../utils/experienceUtils');

module.exports = {
  name: 'levelconfig',
  description: 'Configura el sistema de niveles',
  usage: 'c!levelconfig [opción] [valor]',
  run: async (client, message, args, lang) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply(getResponse(lang, 'noPermission'));
    }

    const config = getLevelConfig();

    if (args.length === 0) {
      // Mostrar la configuración actual
      const embed = createConfigEmbed(config, lang);
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
      case 'xprange':
        const [minLevel, maxLevel, minXP, maxXP] = value.split(' ').map(Number);
        if ([minLevel, maxLevel, minXP, maxXP].some(isNaN)) {
          return message.reply(getResponse(lang, 'invalidXPRange'));
        }
        const existingRange = config.xpRanges.find(range => range.minLevel <= minLevel && range.maxLevel >= maxLevel);
        if (existingRange) {
          Object.assign(existingRange, { minLevel, maxLevel, minXP, maxXP });
        } else {
          config.xpRanges.push({ minLevel, maxLevel, minXP, maxXP });
        }
        break;
      case 'messagexp':
        const [minLength, maxLength, xp] = value.split(' ').map(Number);
        if ([minLength, maxLength, xp].some(isNaN)) {
          return message.reply(getResponse(lang, 'invalidMessageXP'));
        }
        const existingMessageXP = config.messageLengthXP.find(range => range.minLength <= minLength && range.maxLength >= maxLength);
        if (existingMessageXP) {
          Object.assign(existingMessageXP, { minLength, maxLength, xp });
        } else {
          config.messageLengthXP.push({ minLength, maxLength, xp });
        }
        break;
      default:
        return message.reply(getResponse(lang, 'invalidOption'));
    }

    saveLevelConfig(config);
    const embed = createConfigEmbed(config, lang);
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
          { name: 'XP Command Cooldown', value: 'xpcommandcooldown' },
          { name: 'XP Range', value: 'xprange' },
          { name: 'Message XP', value: 'messagexp' }
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
      case 'xprange':
        const [minLevel, maxLevel, minXP, maxXP] = value.split(' ').map(Number);
        if ([minLevel, maxLevel, minXP, maxXP].some(isNaN)) {
          return interaction.reply({ content: getResponse(lang, 'invalidXPRange'), ephemeral: true });
        }
        const existingRange = config.xpRanges.find(range => range.minLevel <= minLevel && range.maxLevel >= maxLevel);
        if (existingRange) {
          Object.assign(existingRange, { minLevel, maxLevel, minXP, maxXP });
        } else {
          config.xpRanges.push({ minLevel, maxLevel, minXP, maxXP });
        }
        break;
      case 'messagexp':
        const [minLength, maxLength, xp] = value.split(' ').map(Number);
        if ([minLength, maxLength, xp].some(isNaN)) {
          return interaction.reply({ content: getResponse(lang, 'invalidMessageXP'), ephemeral: true });
        }
        const existingMessageXP = config.messageLengthXP.find(range => range.minLength <= minLength && range.maxLength >= maxLength);
        if (existingMessageXP) {
          Object.assign(existingMessageXP, { minLength, maxLength, xp });
        } else {
          config.messageLengthXP.push({ minLength, maxLength, xp });
        }
        break;
      default:
        return interaction.reply({ content: getResponse(lang, 'invalidOption'), ephemeral: true });
    }

    saveLevelConfig(config);
    const embed = createConfigEmbed(config, lang);
    return interaction.reply({ content: getResponse(lang, 'configUpdated'), embeds: [embed] });
  },
};

function createConfigEmbed(config, lang) {
  return new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(getResponse(lang, 'configTitle'))
    .addFields(
      { name: getResponse(lang, 'xpCommandCooldown'), value: `${config.xpCommandCooldown / (60 * 60 * 1000)} ${getResponse(lang, 'hours')}` },
      { name: getResponse(lang, 'xpRanges'), value: config.xpRanges.map(range => 
        `${getResponse(lang, 'level')} ${range.minLevel}-${range.maxLevel}: ${range.minXP}-${range.maxXP} XP`
      ).join('\n') },
      { name: getResponse(lang, 'messageXP'), value: config.messageLengthXP.map(range => 
        `${range.minLength}-${range.maxLength} ${getResponse(lang, 'characters')}: ${range.xp} XP`
      ).join('\n') }
    )
    .setFooter({ text: getResponse(lang, 'configFooter') });
}

function getResponse(lang, key, ...args) {
  const responses = {
    es: {
      noPermission: 'No tienes permiso para configurar el sistema de niveles.',
      invalidCooldown: 'El tiempo de espera debe ser un número positivo.',
      invalidXPRange: 'El rango de XP debe ser especificado como: minLevel maxLevel minXP maxXP',
      invalidMessageXP: 'La XP por mensaje debe ser especificada como: minLength maxLength xp',
      invalidOption: 'Opción inválida. Usa xpcommandcooldown, xprange, o messagexp.',
      configUpdated: 'Configuración actualizada con éxito.',
      configTitle: '⚙️ Configuración del Sistema de Niveles',
      xpCommandCooldown: 'Tiempo de espera del comando XP',
      xpRanges: 'Rangos de XP',
      messageXP: 'XP por longitud de mensaje',
      level: 'Nivel',
      characters: 'caracteres',
      hours: 'horas',
      configFooter: 'Usa c!levelconfig [opción] [valor] para modificar la configuración.'
    },
    en: {
      noPermission: 'You don\'t have permission to configure the level system.',
      invalidCooldown: 'Cooldown must be a positive number.',
      invalidXPRange: 'XP range must be specified as: minLevel maxLevel minXP maxXP',
      invalidMessageXP: 'Message XP must be specified as: minLength maxLength xp',
      invalidOption: 'Invalid option. Use xpcommandcooldown, xprange, or messagexp.',
      configUpdated: 'Configuration updated successfully.',
      configTitle: '⚙️ Level System Configuration',
      xpCommandCooldown: 'XP Command Cooldown',
      xpRanges: 'XP Ranges',
      messageXP: 'XP per message length',
      level: 'Level',
      characters: 'characters',
      hours: 'hours',
      configFooter: 'Use c!levelconfig [option] [value] to modify the configuration.'
    },
    pt: {
      noPermission: 'Você não tem permissão para configurar o sistema de níveis.',
      invalidCooldown: 'O tempo de espera deve ser um número positivo.',
      invalidXPRange: 'O intervalo de XP deve ser especificado como: minLevel maxLevel minXP maxXP',
      invalidMessageXP: 'O XP por mensagem deve ser especificado como: minLength maxLength xp',
      invalidOption: 'Opção inválida. Use xpcommandcooldown, xprange ou messagexp.',
      configUpdated: 'Configuração atualizada com sucesso.',
      configTitle: '⚙️ Configuração do Sistema de Níveis',
      xpCommandCooldown: 'Tempo de espera do comando XP',
      xpRanges: 'Intervalos de XP',
      messageXP: 'XP por comprimento de mensagem',
      level: 'Nível',
      characters: 'caracteres',
      hours: 'horas',
      configFooter: 'Use c!levelconfig [opção] [valor] para modificar a configuração.'
    }
  };

  let message = responses[lang][key] || responses['en'][key];
  for (let i = 0; i < args.length; i++) {
    message = message.replace('%s', args[i]);
  }
  return message;
}

