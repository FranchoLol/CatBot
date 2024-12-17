const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getUserData, saveUserData, formatNumber, calculateStorageUsed, calculateTotalStorage, getUnlockedLanguages, generateLines, levelUp, calculateXP, createLevelUpEmbed, gameConfig, getActiveLanguages } = require('../utils/helpers');
const { createNavigationRow } = require('../utils/button_handler');

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
    const result = await executeDesign(userId, args[0]);
    if (result.levelUp) {
      await message.channel.send({ embeds: [result.levelUpEmbed] });
    }
    message.reply({ embeds: [result.embed], components: [createNavigationRow('design')] });
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
        const cooldownMessage = await interaction.reply({ content: `Por favor espera ${timeLeft.toFixed(1)} segundos antes de usar el comando design de nuevo.`, ephemeral: true });
      
        // Eliminar el mensaje de cooldown después de que expire
        setTimeout(() => cooldownMessage.delete().catch(() => {}), timeLeft * 1000);
        return;
      }
    }

    userCooldowns.set(userId, now);
    const result = await executeDesign(userId, interaction.options?.getString('lenguaje'));
  
    const response = { embeds: [result.embed], components: [createNavigationRow('design')] };
  
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(response);
    } else {
      await interaction.reply(response);
    }

    if (result.levelUp) {
      await interaction.channel.send({ embeds: [result.levelUpEmbed] });
    }
  },
};

async function executeDesign(userId, selectedLanguage) {
  const userData = getUserData(userId);
  const activeLanguages = userData.activeLanguages || getActiveLanguages(userData);

  let totalLinesGenerated = 0;
  let generatedLines = {};

  // Generate lines for active languages
  for (const language of activeLanguages) {
    const lines = generateLines(language, userData.level, userData.performanceBoost);
    generatedLines[language] = lines;
    totalLinesGenerated += lines;
  }

  userData.totalLinesGenerated += totalLinesGenerated; // Added line

  // Check storage
  const currentStorage = calculateStorageUsed(userData);
  const totalStorage = calculateTotalStorage(userData);
  if (currentStorage + totalLinesGenerated > totalStorage) {
    return {
      embed: new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Almacenamiento Lleno')
        .setDescription('No tienes suficiente almacenamiento para guardar más líneas de código.')
        .addFields(
          { name: 'Almacenamiento Actual', value: `${formatNumber(currentStorage)}/${formatNumber(totalStorage)} bytes`, inline: true }
        )
    };
  }

  // Add generated lines to user data
  for (const [lang, lines] of Object.entries(generatedLines)) {
    userData.languages[lang] = (userData.languages[lang] || 0) + lines;
  }

  // Calculate and add XP
  const xpGained = calculateXP(userData.level, totalLinesGenerated);
  userData.xp += xpGained;

  // Check for level up
  let leveledUp = false;
  let newLevel = userData.level;
  let moneyReward = 0;
  while (levelUp(userData)) {
    leveledUp = true;
    newLevel = userData.level;
    const levelConfig = gameConfig.levels.find(l => l.level === newLevel) || { moneyReward: 0 };
    moneyReward += levelConfig.moneyReward;
    // Reset XP after leveling up, carrying over excess XP
    const nextLevelConfig = gameConfig.levels.find(l => l.level > newLevel);
    if (nextLevelConfig) {
      userData.xp = userData.xp - nextLevelConfig.xpRequired;
    } else {
      userData.xp = 0;
    }
  }

  saveUserData({ [userId]: userData });

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('💻 Diseño de Código')
    //.setDescription(`Has generado código en ${Object.keys(generatedLines).length} lenguaje(s)`)
    .setDescription(`Líneas Generadas: ${formatNumber(totalLinesGenerated)}`)
    .setFooter({ text: `Almacenamiento: ${formatNumber(currentStorage + totalLinesGenerated)}/${formatNumber(totalStorage)} bytes | Líneas de código totales generadas: ${formatNumber(userData.totalLinesGenerated)}` });

  Object.entries(generatedLines).forEach(([lang, lines]) => {
    embed.addFields({ name: lang, value: `${formatNumber(lines)} líneas`, inline: true });
  });

  embed.addFields({ name: 'XP Ganada', value: formatNumber(xpGained), inline: false });

  let levelUpEmbed;
  if (leveledUp) {
    levelUpEmbed = createLevelUpEmbed({ id: userId }, newLevel, moneyReward);
  }

  return {
    embed,
    levelUp: leveledUp,
    levelUpEmbed
  };
}

