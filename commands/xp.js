const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { canUseXpCommand, useXpCommand, getRemainingCooldown } = require('../utils/experienceUtils');

module.exports = {
  name: 'xp',
  description: 'Obtén XP diaria',
  usage: 'c!xp',
  run: async (client, message, args, lang) => {
    const { guildId, author } = message;
    await handleXpCommand(message, guildId, author, lang);
  },
  data: new SlashCommandBuilder()
    .setName('xp')
    .setDescription('Obtén XP diaria'),
  async execute(interaction, lang) {
    const { guildId, user } = interaction;
    await handleXpCommand(interaction, guildId, user, lang);
  },
};

async function handleXpCommand(context, guildId, user, lang) {
  if (canUseXpCommand(guildId, user.id)) {
    const result = useXpCommand(guildId, user.id);
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(getResponse(lang, 'xpCommandTitle'))
      .setDescription(getResponse(lang, 'xpCommandSuccess', result.xpAdded, result.newXp, result.newLevel))
      .setFooter({ text: getResponse(lang, 'xpCommandFooter') });

    await context.reply({ embeds: [embed] });
  } else {
    const remainingTime = getRemainingCooldown(guildId, user.id);
    const { hours, minutes, seconds } = formatTime(remainingTime);
    
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle(getResponse(lang, 'xpCommandTitle'))
      .setDescription(getResponse(lang, 'xpCommandCooldown', hours, minutes, seconds))
      .setFooter({ text: getResponse(lang, 'xpCommandFooter') });

    await context.reply({ embeds: [embed] });
  }
}

function formatTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  return { hours, minutes, seconds };
}

function getResponse(lang, key, ...args) {
  const responses = {
    es: {
      xpCommandTitle: '🌟 Comando XP Diario',
      xpCommandSuccess: '¡Has obtenido %s XP! Ahora tienes %s XP en total y estás en el nivel %s.',
      xpCommandCooldown: 'Debes esperar %s horas, %s minutos y %s segundos antes de poder usar este comando nuevamente.',
      xpCommandFooter: 'Recuerda usar este comando cada día para obtener XP extra.'
    },
    en: {
      xpCommandTitle: '🌟 Daily XP Command',
      xpCommandSuccess: 'You\'ve gained %s XP! You now have %s XP in total and are at level %s.',
      xpCommandCooldown: 'You must wait %s hours, %s minutes, and %s seconds before using this command again.',
      xpCommandFooter: 'Remember to use this command every day for extra XP.'
    },
    pt: {
      xpCommandTitle: '🌟 Comando XP Diário',
      xpCommandSuccess: 'Você ganhou %s XP! Agora você tem %s XP no total e está no nível %s.',
      xpCommandCooldown: 'Você deve esperar %s horas, %s minutos e %s segundos antes de usar este comando novamente.',
      xpCommandFooter: 'Lembre-se de usar este comando todos os dias para obter XP extra.'
    }
  };

  let message = responses[lang][key] || responses['en'][key];
  for (let i = 0; i < args.length; i++) {
    message = message.replace('%s', args[i]);
  }
  return message;
}

