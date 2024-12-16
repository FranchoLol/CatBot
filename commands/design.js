const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserData, saveUserData, formatNumber, calculateStorageUsed, calculateTotalStorage, getUnlockedLanguages, generateLines, levelUp, calculateXP } = require('../utils/helpers');

const DESIGN_COOLDOWN = 2200; // 2.2 segundos en milisegundos
const userCooldowns = new Map();

module.exports = {
  name: 'design',
  description: 'Programa y consigue líneas de código',
  usage: 'c!design [lenguaje]',
  run: async (client, message, args) => {
    const userId = message.author.id;
    const now = Date.now();

    if (userCooldowns.has(userId)) {
      const expirationTime = userCooldowns.get(userId) + DESIGN_COOLDOWN;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(`Por favor espera ${timeLeft.toFixed(1)} segundos antes de usar el comando design de nuevo.`);
      }
    }

    userCooldowns.set(userId, now);
    const result = executeDesign(userId, args[0]);
    message.reply(result);
  },
  data: new SlashCommandBuilder()
    .setName('design')
    .setDescription('Programa y consigue líneas de código')
    .addStringOption(option =>
      option.setName('lenguaje')
        .setDescription('Lenguaje en el que quieres programar')
        .setRequired(false)),
  async execute(interaction) {
    const userId = interaction.user.id;
    const now = Date.now();

    if (userCooldowns.has(userId)) {
      const expirationTime = userCooldowns.get(userId) + DESIGN_COOLDOWN;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return interaction.reply(`Por favor espera ${timeLeft.toFixed(1)} segundos antes de usar el comando design de nuevo.`);
      }
    }

    userCooldowns.set(userId, now);
    const result = executeDesign(userId, interaction.options.getString('lenguaje'));
    interaction.reply(result);
  },
};

function executeDesign(userId, selectedLanguage) {
  const userData = getUserData(userId);
  const unlockedLanguages = getUnlockedLanguages(userData.level);

  // Seleccionar el lenguaje
  let language = selectedLanguage && unlockedLanguages.includes(selectedLanguage) ? selectedLanguage : unlockedLanguages[Math.floor(Math.random() * unlockedLanguages.length)];

  const linesGenerated = generateLines(language, userData.level, userData.performanceBoost);

  // Verificar el almacenamiento
  const currentStorage = calculateStorageUsed(userData);
  const totalStorage = calculateTotalStorage(userData);
  if (currentStorage + linesGenerated > totalStorage) {
    return `No tienes suficiente almacenamiento. Almacenamiento actual: ${formatNumber(currentStorage)}/${formatNumber(totalStorage)} bytes.`;
  }

  userData.languages[language] += linesGenerated;
  
  // Calcular y añadir XP
  const xpGained = calculateXP(userData.level, linesGenerated);
  userData.xp += xpGained;

  // Verificar si el usuario subió de nivel
  let leveledUp = false;
  let newLevel = userData.level;
  while (levelUp(userData)) {
    leveledUp = true;
    newLevel = userData.level;
  }

  saveUserData({ [userId]: userData });

  let response = `Has generado ${formatNumber(linesGenerated)} líneas de código en ${language}. Total: ${formatNumber(userData.languages[language])} líneas. Has ganado ${formatNumber(xpGained)} XP.`;
  if (leveledUp) {
    response += ` ¡Has subido al nivel ${newLevel}!`;
    const newLanguages = getUnlockedLanguages(newLevel).filter(lang => !Object.keys(userData.languages).includes(lang));
    if (newLanguages.length > 0) {
      response += ` Has desbloqueado ${newLanguages.join(', ')}.`;
    }
  }

  return response;
}

