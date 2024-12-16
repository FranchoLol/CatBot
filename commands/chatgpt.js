const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserData, saveUserData, formatNumber } = require('../utils/helpers');

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

module.exports = {
  name: 'chatgpt',
  description: 'Obtén tu recompensa diaria de ChatGPT',
  usage: 'c!chatgpt',
  run: async (client, message, args) => {
    const result = executeChatGPT(message.author.id);
    message.reply(result);
  },
  data: new SlashCommandBuilder()
    .setName('chatgpt')
    .setDescription('Obtén tu recompensa diaria de ChatGPT'),
  async execute(interaction) {
    const result = executeChatGPT(interaction.user.id);
    interaction.reply(result);
  },
};

function executeChatGPT(userId) {
  const userData = getUserData(userId);
  const now = Date.now();

  if (userData.lastChatGPTReward && now - userData.lastChatGPTReward < DAILY_COOLDOWN) {
    const timeLeft = DAILY_COOLDOWN - (now - userData.lastChatGPTReward);
    const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    return `Aún no puedes reclamar tu recompensa diaria. Tiempo restante: ${hoursLeft}h ${minutesLeft}m.`;
  }

  const rewardLines = Math.floor(100 + (userData.level * 10));
  const rewardMoney = Math.floor(10 + (userData.level * 2));

  userData.lastChatGPTReward = now;
  userData.languages[Object.keys(userData.languages)[0]] += rewardLines;
  userData.balance += rewardMoney;

  saveUserData({ [userId]: userData });

  return `¡Has recibido tu recompensa diaria de ChatGPT! Obtuviste ${formatNumber(rewardLines)} líneas de código y U$S ${formatNumber(rewardMoney)}.`;
}

