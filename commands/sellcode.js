const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserData, saveUserData, formatNumber, gameConfig } = require('../utils/helpers');

module.exports = {
  name: 'sellcode',
  description: 'Vende líneas de código',
  usage: 'c!sellcode [lenguaje] [cantidad]',
  run: async (client, message, args) => {
    const result = executeSellCode(message.author.id, args[0], args[1]);
    message.reply(result);
  },
  data: new SlashCommandBuilder()
    .setName('sellcode')
    .setDescription('Vende líneas de código')
    .addStringOption(option =>
      option.setName('lenguaje')
        .setDescription('Lenguaje a vender (deja vacío para vender todo)')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de líneas a vender')
        .setRequired(false)),
  async execute(interaction) {
    const language = interaction.options?.getString('lenguaje');
    const amount = interaction.options?.getInteger('cantidad');
    const result = executeSellCode(interaction.user.id, language, amount);
    await interaction.reply(result);
  },
};

function isValidLanguage(language) {
  return gameConfig.languages.some(lang => lang.name.toLowerCase() === language.toLowerCase());
}

function executeSellCode(userId, language, amount) {
  const userData = getUserData(userId);

  if (language && !isValidLanguage(language)) {
    return 'Lenguaje no válido. Por favor, elige un lenguaje que hayas desbloqueado.';
  }

  if (!language) {
    // Vender todas las líneas
    let totalMoney = 0;
    for (const lang in userData.languages) {
      const langConfig = gameConfig.languages.find(l => l.name === lang);
      totalMoney += (userData.languages[lang] || 0) * (langConfig?.exchangeRate || 0);
      userData.languages[lang] = 0;
    }
    userData.balance += totalMoney;
    saveUserData({ [userId]: userData });
    return `Has vendido todas tus líneas de código por U$S ${formatNumber(totalMoney)}. Tu nuevo balance es U$S ${formatNumber(userData.balance)}.`;
  }

  if (!userData.languages[language]) {
    return 'No tienes líneas de código en ese lenguaje.';
  }

  const langConfig = gameConfig.languages.find(l => l.name === language);

  if (!amount) {
    // Vender todas las líneas del lenguaje especificado
    const totalMoney = (userData.languages[language] || 0) * (langConfig?.exchangeRate || 0);
    userData.balance += totalMoney;
    userData.languages[language] = 0;
    saveUserData({ [userId]: userData });
    return `Has vendido todas tus líneas de ${language} por U$S ${formatNumber(totalMoney)}. Tu nuevo balance es U$S ${formatNumber(userData.balance)}.`;
  }

  if (amount > (userData.languages[language] || 0)) {
    return `No tienes suficientes líneas de ${language}. Tienes ${userData.languages[language] || 0} líneas.`;
  }

  const money = amount * (langConfig?.exchangeRate || 0);
  userData.balance += money;
  userData.languages[language] -= amount;
  saveUserData({ [userId]: userData });

  return `Has vendido ${amount} líneas de ${language} por U$S ${formatNumber(money)}. Tu nuevo balance es U$S ${formatNumber(userData.balance)}.`;
}

