const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getUserData, saveUserData, formatNumber, calculateStorageUsed, calculateTotalStorage, getUnlockedLanguages, generateLines, levelUp, calculateXP, createLevelUpEmbed } = require('../utils/helpers');
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
    message.reply({ embeds: [result.embed], components: [createNavigationRow()] });
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
    const result = await executeDesign(userId, interaction.options.getString('lenguaje'));
    if (result.levelUp) {
      await interaction.channel.send({ embeds: [result.levelUpEmbed] });
    }
    interaction.reply({ embeds: [result.embed], components: [createNavigationRow()] });
  },
};

async function executeDesign(userId, selectedLanguage) {
  const userData = getUserData(userId);
  const unlockedLanguages = getUnlockedLanguages(userData.level);

  // Seleccionar el lenguaje
  let language = selectedLanguage && unlockedLanguages.includes(selectedLanguage) ? selectedLanguage : unlockedLanguages[Math.floor(Math.random() * unlockedLanguages.length)];

  const linesGenerated = generateLines(language, userData.level, userData.performanceBoost);

  // Verificar el almacenamiento
  const currentStorage = calculateStorageUsed(userData);
  const totalStorage = calculateTotalStorage(userData);
  if (currentStorage + linesGenerated > totalStorage) {
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

  userData.languages[language] += linesGenerated;
  
  // Calcular y añadir XP
  const xpGained = calculateXP(userData.level, linesGenerated);
  userData.xp += xpGained;

  // Verificar si el usuario subió de nivel
  let leveledUp = false;
  let newLevel = userData.level;
  let moneyReward = 0;
  while (levelUp(userData)) {
    leveledUp = true;
    newLevel = userData.level;
    const levelConfig = gameConfig.levels.find(l => l.level === newLevel);
    moneyReward += levelConfig.moneyReward;
  }

  saveUserData({ [userId]: userData });

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('💻 Diseño de Código')
    .setDescription(`Has generado código en ${language}`)
    .addFields(
      { name: 'Líneas Generadas', value: formatNumber(linesGenerated), inline: true },
      { name: 'Total de Líneas', value: formatNumber(userData.languages[language]), inline: true },
      { name: '\u200B', value: '\u200B' },
      { name: 'XP Ganada', value: formatNumber(xpGained), inline: true },
      { name: 'XP Total', value: formatNumber(userData.xp), inline: true }
    )
    .setFooter({ text: `Almacenamiento: ${formatNumber(currentStorage + linesGenerated)}/${formatNumber(totalStorage)} bytes` });

  Object.entries(userData.languages).forEach(([lang, lines]) => {
    embed.addFields({ name: lang, value: formatNumber(lines), inline: true });
  });

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

