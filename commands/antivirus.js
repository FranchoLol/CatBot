const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserData, saveUserData } = require('../utils/helpers');

const ANTIVIRUS_DURATION = 4 * 60 * 60 * 1000; // 4 horas en milisegundos

module.exports = {
  name: 'antivirus',
  description: 'Ejecuta un antivirus en tu setup',
  usage: 'c!antivirus',
  run: async (client, message, args) => {
    const result = executeAntivirus(message.author.id);
    message.reply(result);
  },
  data: new SlashCommandBuilder()
    .setName('antivirus')
    .setDescription('Ejecuta un antivirus en tu setup'),
  async execute(interaction) {
    const result = executeAntivirus(interaction.user.id);
    interaction.reply(result);
  },
};

function executeAntivirus(userId) {
  const userData = getUserData(userId);
  const now = Date.now();

  if (userData.antivirusRunning) {
    const timeLeft = userData.antivirusEnd - now;
    const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    return `El antivirus ya está en ejecución. Tiempo restante: ${hoursLeft}h ${minutesLeft}m.`;
  }

  userData.antivirusRunning = true;
  userData.antivirusEnd = now + ANTIVIRUS_DURATION;
  saveUserData({ [userId]: userData });

  return 'Has iniciado el antivirus. Tu setup estará inaccesible durante las próximas 4 horas mientras se elimina el malware.';
}

