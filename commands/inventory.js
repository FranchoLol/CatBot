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
      components: [createNavigationRow()]
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
    const target = interaction.options.getUser('usuario') || interaction.user;
    const userData = getUserData(target.id);
    const embed = createInventoryEmbed(target, userData);
    interaction.reply({ 
      embeds: [embed],
      components: [createNavigationRow()]
    });
  },
};

function createInventoryEmbed(user, userData) {
  const totalLines = Object.values(userData.languages).reduce((sum, lines) => sum + lines, 0);
  const moneyInLines = Object.entries(userData.languages).reduce((sum, [lang, lines]) => {
    const langConfig = gameConfig.languages.find(l => l.name === lang);
    return sum + lines * langConfig.exchangeRate;
  }, 0);

  const storageUsed = calculateStorageUsed(userData);
  const totalStorage = calculateTotalStorage(userData);

  const nextLevelConfig = gameConfig.levels.find(l => l.level > userData.level);
  const xpToNextLevel = nextLevelConfig ? nextLevelConfig.xpRequired - userData.xp : 'Max';

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`Developer ${user.tag}`)
    .setDescription(`Level ${userData.level}, ${formatNumber(userData.xp)} XP (${formatNumber(xpToNextLevel)} para el siguiente nivel)
Balance: U$S ${formatNumber(userData.balance)}
Booster: ${userData.performanceBoost > 1 ? `${((userData.performanceBoost - 1) * 100).toFixed(0)}% ☕` : 'none'}

Almacenamiento: ${formatNumber(storageUsed)}/${formatNumber(totalStorage)} bytes ${storageUsed >= totalStorage ? '(LLENO)' : ''}

Dinero en líneas: U$S ${formatNumber(moneyInLines)}
Líneas de código totales: ${formatNumber(totalLines)}`)
    .setFooter({ text: 'Usa los comandos: design, shopgamer, setup, sellcode' });

  Object.entries(userData.languages).forEach(([lang, lines]) => {
    const langConfig = gameConfig.languages.find(l => l.name === lang);
    embed.addFields({
      name: lang,
      value: `${formatNumber(lines)} líneas (${formatNumber(lines * gameConfig.bytesPerLine)} bytes) - U$S ${formatNumber(lines * langConfig.exchangeRate)}`,
      inline: true
    });
  });

  if (storageUsed >= totalStorage) {
    embed.addFields({
      name: '⚠️ ALMACENAMIENTO LLENO',
      value: 'No puedes generar más líneas de código. Considera vender código o aumentar tu almacenamiento.'
    });
  }

  return embed;
}

