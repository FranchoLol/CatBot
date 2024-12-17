const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const dataPath = path.join(__dirname, '..', 'data', 'users.json');
const configPath = path.join(__dirname, '..', 'data', 'game_config.json');
const birthdayPath = path.join(__dirname, '..', 'data', 'birthdays.json');
const birthdayConfigPath = path.join(__dirname, '..', 'data', 'birthdayConfig.json');

const gameConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function getUserData(userId) {
  let users = {};
  if (fs.existsSync(dataPath)) {
    users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }

  if (!users[userId]) {
    const initialLanguages = getUnlockedLanguages(0);
    const languages = {};
    initialLanguages.forEach(lang => {
      languages[lang] = 0;
    });

    users[userId] = {
      level: 0,
      xp: 0,
      balance: 0,
      storage: gameConfig.baseStorageCapacity,
      languages: languages,
      setup: {},
      lastChatGPTReward: 0,
      lastFreelance: 0,
      lastCleaning: 0,
      performanceBoost: 1,
      totalLinesGenerated: 0  // Nuevo campo
    };
    saveUserData(users);
  }

  return users[userId];
}

function saveUserData(users) {
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
}

function formatNumber(num) {
  if (num === null || num === undefined) {
    return '0';
  }
  return num.toLocaleString('en-US');
}

function calculateStorageUsed(userData) {
  return Object.values(userData.languages).reduce((total, lines) => total + lines * gameConfig.bytesPerLine, 0);
}

function calculateTotalStorage(userData) {
  return gameConfig.baseStorageCapacity;
}

function getLanguageEfficiency(language) {
  const langConfig = gameConfig.languages.find(l => l.name === language);
  return langConfig ? langConfig.efficiency : 1;
}

function levelUp(userData) {
  const currentLevelConfig = gameConfig.levels.find(l => l.level === userData.level);
  const nextLevelConfig = gameConfig.levels.find(l => l.level > userData.level);

  if (nextLevelConfig && userData.xp >= nextLevelConfig.xpRequired) {
    const excessXP = userData.xp - nextLevelConfig.xpRequired;
    userData.level = nextLevelConfig.level;
    userData.balance += nextLevelConfig.moneyReward;
    userData.xp = excessXP; // Establecer el XP excedente

    // Verificar si se ha desbloqueado un nuevo lenguaje
    const newLanguage = gameConfig.languages.find(l => l.unlockLevel === userData.level);
    if (newLanguage && !userData.languages[newLanguage.name]) {
      userData.languages[newLanguage.name] = 0;
      userData.newLanguageUnlocked = newLanguage.name; // Añadir esta propiedad para anunciar el nuevo lenguaje
    }

    // Actualizar lenguajes activos
    userData = updateActiveLanguages(userData);

    return true;
  }

  return false;
}

function getUnlockedLanguages(level) {
  return gameConfig.languages.filter(lang => lang.unlockLevel <= level).map(lang => lang.name);
}

function generateLines(language, level, performanceBoost) {
  const langConfig = gameConfig.languages.find(l => l.name === language);
  const baseLines = gameConfig.baseDesignLines;
  const levelBonus = 1 + (level * gameConfig.lineGrowthFactor);
  return Math.floor(baseLines * langConfig.efficiency * gameConfig.designBonus * performanceBoost * levelBonus);
}

function calculateXP(level, linesGenerated) {
  const levelConfig = gameConfig.levels.find(l => l.level <= level && gameConfig.levels.find(nl => nl.level > level).level > l.level);
  return Math.floor(gameConfig.baseXP * linesGenerated * levelConfig.xpMultiplier);
}

function createLevelUpEmbed(user, newLevel, moneyReward) {
  return new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🎉 ¡SUBIDA DE NIVEL! 🎉')
    .setDescription(`¡Felicidades, <@${user.id}>! Has alcanzado el nivel **${newLevel}**`)
    .addFields(
      { name: '💰 Recompensa', value: `U$S ${formatNumber(moneyReward)}`, inline: true },
      { name: '🆙 Nuevo Nivel', value: `${newLevel}`, inline: true }
    )
    .setFooter({ text: 'Sigue programando para desbloquear más lenguajes y características' })
    .setTimestamp();
}

function getActiveLanguages(userData) {
  const activeLanguages = Object.entries(userData.languages)
    .filter(([lang, lines]) => lines > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);

  return activeLanguages;
}

function updateActiveLanguages(userData) {
  const unlockedLanguages = getUnlockedLanguages(userData.level);
  if (!userData.activeLanguages || userData.activeLanguages.length === 0) {
    userData.activeLanguages = unlockedLanguages.slice(0, 3);
  } else {
    // Mantener los lenguajes activos seleccionados por el usuario
    userData.activeLanguages = userData.activeLanguages.filter(lang => unlockedLanguages.includes(lang));
    // Añadir nuevos lenguajes desbloqueados si hay espacio
    while (userData.activeLanguages.length < 3 && unlockedLanguages.length > userData.activeLanguages.length) {
      const newLang = unlockedLanguages.find(lang => !userData.activeLanguages.includes(lang));
      if (newLang) {
        userData.activeLanguages.push(newLang);
      }
    }
  }
  return userData;
}

function getBirthdayChannelConfig() {
  if (!fs.existsSync(birthdayConfigPath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(birthdayConfigPath, 'utf8'));
}

async function checkForBirthdays(client) {
  if (!fs.existsSync(birthdayPath)) {
    return [];
  }

  const birthdays = JSON.parse(fs.readFileSync(birthdayPath, 'utf8'));
  const today = new Date();
  const todayString = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;

  const birthdayUsers = birthdays[todayString] || [];
  const channelConfigs = getBirthdayChannelConfig();

  for (const guildId in channelConfigs) {
    const guild = await client.guilds.fetch(guildId);
    const channelId = channelConfigs[guildId].channelId;
    const channel = await guild.channels.fetch(channelId);

    if (channel) {
      const guildMembers = await guild.members.fetch();
      const birthdayMembersInGuild = birthdayUsers.filter(userId => guildMembers.has(userId));

      for (const userId of birthdayMembersInGuild) {
        const user = await client.users.fetch(userId);
        sendBirthdayMessage(channel, user);
      }
    }
  }
}

function sendBirthdayMessage(channel, user) {
  const embed = new EmbedBuilder()
    .setColor('#FF69B4')
    .setTitle('🎉 ¡Feliz Cumpleaños! 🎂')
    .setDescription(`Hoy es el cumpleaños de ${user}. ¡Felicidades!`)
    .setTimestamp();

  channel.send({ embeds: [embed] });
}

function addMessageExperience(guildId, userId, messageLength, channelId) {
  const xpGained = Math.floor(messageLength / 10); 
  const userData = getUserData(userId);
  userData.xp += xpGained;
  saveUserData({ [userId]: userData });
  return { leveledUp: levelUp(userData), level: userData.level };
}

module.exports = {
  getUserData,
  saveUserData,
  formatNumber,
  calculateStorageUsed,
  calculateTotalStorage,
  getLanguageEfficiency,
  levelUp,
  gameConfig,
  getUnlockedLanguages,
  generateLines,
  calculateXP,
  createLevelUpEmbed,
  getActiveLanguages,
  updateActiveLanguages,
  getBirthdayChannelConfig,
  checkForBirthdays,
  sendBirthdayMessage,
  addMessageExperience,
};

