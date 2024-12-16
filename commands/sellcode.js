const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserData, saveUserData, formatNumber, gameConfig } = require('../utils/helpers');

module.exports = {
  name: 'sellcode',
  description: 'Vende tus líneas de código por dinero',
  usage: 'c!sellcode [lenguaje] [cantidad]',
  run: async (client, message, args) => {
    const result = executeSellCode(message.author.id, args[0], args[1]);
    message.reply(result);
  },
  data: new SlashCommandBuilder()
    .setName('sellcode')
    .setDescription('Vende tus líneas de código por dinero')
    .addStringOption(option =>
      option.setName('lenguaje')
        .setDescription('Lenguaje del código que quieres vender')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de líneas que quieres vender')
        .setRequired(false)),
  async execute(interaction) {
    const result = executeSellCode(
      interaction.user.id,
      interaction.options.getString('lenguaje'),
      interaction.options.getInteger('cantidad')
    );
    interaction.reply(result);
  },
};

function executeSellCode(userId, language, amount) {
  const userData = getUserData(userId);
  let totalLines = 0;
  let totalMoney = 0;

  if (language && amount) {
    if (!userData.languages[language]) {
      return `No tienes líneas de código en ${language}.`;
    }
    if (userData.languages[language] < amount) {
      return `No tienes suficientes líneas de código en ${language}. Tienes ${formatNumber(userData.languages[language])} líneas.`;
    }
    totalLines = amount;
    const langConfig = gameConfig.languages.find(l => l.name === language);
    totalMoney = amount * langConfig.exchangeRate;
    userData.languages[language] -= amount;
  } else {
    for (const [lang, lines] of Object.entries(userData.languages)) {
      totalLines += lines;
      const langConfig = gameConfig.languages.find(l => l.name === lang);
      totalMoney += lines * langConfig.exchangeRate;
      userData.languages[lang] = 0;
    }
  }

  userData.balance += totalMoney;
  saveUserData({ [userId]: userData });

  return `Has vendido ${formatNumber(totalLines)} líneas de código por U$S ${formatNumber(totalMoney.toFixed(2))}. Tu nuevo balance es U$S ${formatNumber(userData.balance.toFixed(2))}.`;
}

