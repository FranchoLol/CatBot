const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserData, saveUserData } = require('../utils/helpers');

const CLEANING_COOLDOWN = 6 * 60 * 60 * 1000; // 6 horas en milisegundos

module.exports = {
  name: 'cleaning',
  description: 'Limpia tu setup para mejorar el rendimiento',
  usage: 'c!cleaning',
  run: async (client, message, args) => {
    const result = executeCleaning(message.author.id);
    message.reply(result);
  },
  data: new SlashCommandBuilder()
    .setName('cleaning')
    .setDescription('Limpia tu setup para mejorar el rendimiento'),
  async execute(interaction) {
    const result = executeCleaning(interaction.user.id);
    interaction.reply(result);
  },
};

function executeCleaning(userId) {
  const userData = getUserData(userId);
  const now = Date.now();

  if (userData.lastCleaning && now - userData.lastCleaning < CLEANING_COOLDOWN) {
    const timeLeft = CLEANING_COOLDOWN - (now - userData.lastCleaning);
    const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
    return `Tu setup aún está limpio. Podrás limpiarlo nuevamente en ${hoursLeft} horas.`;
  }

  userData.lastCleaning = now;
  userData.performanceBoost = 1.1; // 10% de aumento de rendimiento
  saveUserData({ [userId]: userData });

  return '¡Has limpiado tu setup! Obtienes un 10% de aumento en el rendimiento durante las próximas 6 horas.';
}

