const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getUserData, formatNumber, calculateStorageUsed, calculateTotalStorage, gameConfig } = require('../utils/helpers');
const { createNavigationRow } = require('../utils/button_handler');

module.exports = {
  name: 'inventory',
  description: 'Muestra el inventario y estadísticas del desarrollador',
  usage: 'c!inventory [@usuario/id]',
  run: async (client, message, args) => {
    const target = message.mentions.users.first() || message.author;
    const userData = getUserData(target.id);
    const embed = createInventoryEmbed(target, userData);
    message.reply({ 
      embeds: [embed],
      components: [createNavigationRow('inventory')]
    });
  },
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Muestra el inventario y estadísticas del desarrollador')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario del que quieres ver el inventario')
        .setRequired(false)),
  async execute(interaction) {
    const target = interaction.options?.getUser('usuario') || interaction.user;
    const userData = getUserData(target.id);
    const embed = createInventoryEmbed(target, userData);
    
    const response = { embeds: [embed], components: [createNavigationRow('inventory')] };
    
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(response);
    } else {
      await interaction.reply(response);
    }
  },
};

function createInventoryEmbed(user, userData) {
  const totalLines = Object.values(userData.languages).reduce((sum, lines) => sum + (lines || 0), 0);
  const moneyInLines = Object.entries(userData.languages).reduce((sum, [lang, lines]) => {
    const langConfig = gameConfig.languages.find(l => l.name === lang);
    return sum + (lines || 0) * (langConfig?.exchangeRate || 0);
  }, 0);

  const storageUsed = calculateStorageUsed(userData);
  const totalStorage = calculateTotalStorage(userData);

  const nextLevelConfig = gameConfig.levels.find(l => l.level > (userData.level || 0));
  const xpToNextLevel = nextLevelConfig ? nextLevelConfig.xpRequired - (userData.xp || 0) : 'Max';
  const xpNeeded = nextLevelConfig ? nextLevelConfig.xpRequired : (userData.xp || 0);

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`Developer ${user.tag}`)
    .setDescription(`**Level: ${userData.level || 0}**, ${userData.xp || 0}/${xpNeeded} XP ${xpToNextLevel !== 'Max' ? `(${formatNumber(xpToNextLevel)} para el siguiente nivel)` : ''}
Balance: U$S ${formatNumber(userData.balance)}
Booster: ${userData.performanceBoost > 1 ? `${((userData.performanceBoost - 1) * 100).toFixed(0)}% ☕` : 'none'}

Almacenamiento: ${formatNumber(storageUsed)}/${formatNumber(totalStorage)} bytes ${storageUsed >= totalStorage ? '(LLENO)' : ''}`)
    .setFooter({ text: `Líneas de código totales generadas: ${formatNumber(userData.totalLinesGenerated || 0)}` });

  const getActiveLanguages = (userData) => {
    return Object.keys(userData.languages).filter(lang => userData.languages[lang] > 0);
  };

  const activeLanguages = getActiveLanguages(userData);
  activeLanguages.forEach(lang => {
    const lines = userData.languages[lang];
    const langConfig = gameConfig.languages.find(l => l.name === lang);
    const bytes = lines * gameConfig.bytesPerLine;
    const sellValue = lines * (langConfig?.exchangeRate || 0);
    embed.addFields({ name: lang, value: `${formatNumber(lines)} líneas (${formatNumber(bytes)} bytes) - U$S ${formatNumber(sellValue)}`, inline: true });
  });

  embed.addFields({ name: 'Dinero en líneas', value: `U$S ${formatNumber(moneyInLines)}`, inline: false });

  if (storageUsed >= totalStorage) {
    embed.addFields({
      name: '⚠️ ALMACENAMIENTO LLENO',
      value: 'No puedes generar más líneas de código. Considera vender código o aumentar tu almacenamiento.'
    });
  }

  return embed;
}

