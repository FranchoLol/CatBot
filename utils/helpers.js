const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'users.json');
const configPath = path.join(__dirname, '..', 'data', 'game_config.json');

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
      performanceBoost: 1
    };
    saveUserData(users);
  }

  return users[userId];
}

function saveUserData(users) {
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
}

function formatNumber(num) {
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
    userData.level = nextLevelConfig.level;
    userData.balance += nextLevelConfig.moneyReward;
    
    // Unlock new language if available
    const newLanguage = gameConfig.languages.find(l => l.unlockLevel === userData.level);
    if (newLanguage && !userData.languages[newLanguage.name]) {
      userData.languages[newLanguage.name] = 0;
    }

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
  calculateXP
};

