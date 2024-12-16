const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserData, saveUserData, formatNumber } = require('../utils/helpers');

const FREELANCE_COOLDOWN = 60 * 60 * 1000; // 1 hora en milisegundos

module.exports = {
  name: 'freelance',
  description: 'Realiza un trabajo freelance',
  usage: 'c!freelance',
  run: async (client, message, args) => {
    const result = executeFreelance(message.author.id);
    message.reply(result);
  },
  data: new SlashCommandBuilder()
    .setName('freelance')
    .setDescription('Realiza un trabajo freelance'),
  async execute(interaction) {
    const result = executeFreelance(interaction.user.id);
    interaction.reply(result);
  },
};

function executeFreelance(userId) {
  const userData = getUserData(userId);
  const now = Date.now();

  if (userData.lastFreelance && now - userData.lastFreelance < FREELANCE_COOLDOWN) {
    const timeLeft = FREELANCE_COOLDOWN - (now - userData.lastFreelance);
    const minutesLeft = Math.floor(timeLeft / (60 * 1000));
    return `Aún no puedes realizar otro trabajo freelance. Tiempo restante: ${minutesLeft} minutos.`;
  }

  const success = Math.random() < 0.5; // 50% de probabilidad de éxito
  let reward, message;

  if (success) {
    reward = Math.floor(50 + (userData.level * 5));
    userData.balance += reward;
    message = `¡Has completado con éxito un trabajo freelance! Ganaste U$S ${formatNumber(reward)}.`;
  } else {
    const penalty = Math.floor(25 + (userData.level * 2));
    userData.balance -= penalty;
    message = `El trabajo freelance no salió bien. Perdiste U$S ${formatNumber(penalty)}.`;
  }

  userData.lastFreelance = now;
  saveUserData({ [userId]: userData });

  return message;
}

