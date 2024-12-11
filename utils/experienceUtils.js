const fs = require('fs');
const path = require('path');

const experiencePath = path.join(__dirname, '..', 'data', 'experience.json');

function getExperience() {
  if (!fs.existsSync(experiencePath)) {
    fs.writeFileSync(experiencePath, '{}', 'utf8');
    return {};
  }
  return JSON.parse(fs.readFileSync(experiencePath, 'utf8'));
}

function saveExperience(data) {
  fs.writeFileSync(experiencePath, JSON.stringify(data, null, 2), 'utf8');
}

function getUserExperience(guildId, userId) {
  const experience = getExperience();
  if (!experience[guildId]) experience[guildId] = {};
  if (!experience[guildId][userId]) experience[guildId][userId] = { xp: 0, level: 0 };
  return experience[guildId][userId];
}

function setUserExperience(guildId, userId, xp, level) {
  const experience = getExperience();
  if (!experience[guildId]) experience[guildId] = {};
  experience[guildId][userId] = { xp, level };
  saveExperience(experience);
}

function addExperience(guildId, userId, xp) {
  const userExp = getUserExperience(guildId, userId);
  userExp.xp += xp;
  while (userExp.xp >= getXpForNextLevel(userExp.level)) {
    userExp.xp -= getXpForNextLevel(userExp.level);
    userExp.level++;
  }
  setUserExperience(guildId, userId, userExp.xp, userExp.level);
  return userExp;
}

function removeExperience(guildId, userId, xp) {
  const userExp = getUserExperience(guildId, userId);
  const config = getLevelConfig();
  let totalXP = userExp.xp;
  for (let i = 0; i < userExp.level; i++) {
    totalXP += getXpForNextLevel(i, config);
  }
  
  totalXP = Math.max(0, totalXP - xp);
  
  let newLevel = 0;
  let newXP = totalXP;
  
  while (newXP >= getXpForNextLevel(newLevel, config)) {
    newXP -= getXpForNextLevel(newLevel, config);
    newLevel++;
  }
  
  setUserExperience(guildId, userId, newXP, newLevel);
  return { xp: newXP, level: newLevel };
}

function setLevel(guildId, userId, level) {
  const userExp = getUserExperience(guildId, userId);
  userExp.level = level;
  setUserExperience(guildId, userId, userExp.xp, userExp.level);
  return userExp;
}

function getXpForNextLevel(level, config) {
  const levelConfig = config || getLevelConfig();
  const nextLevel = level + 1;
  const levelData = levelConfig.levels.find(l => l.level === nextLevel);
  return levelData ? levelData.xpRequired : 100 * nextLevel;
}

function getLevelConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!config.levels || !Array.isArray(config.levels)) {
      throw new Error('Invalid or missing levels in config');
    }
    return config;
  } catch (error) {
    console.error('Error reading level config:', error);
    return {
      levels: [
        { level: 0, xpRequired: 0 },
        { level: 1, xpRequired: 100 },
        { level: 2, xpRequired: 255 },
        { level: 3, xpRequired: 475 },
        { level: 4, xpRequired: 770 },
        { level: 5, xpRequired: 1150 }
      ],
      xpRanges: [
        { minLevel: 0, maxLevel: 10, minXP: 5, maxXP: 10 }
      ],
      messageLengthXP: [
        { minLength: 1, maxLength: 100, xp: 1 }
      ],
      xpCommandCooldown: 86400000
    };
  }
}



function getTopUsers(guildId, limit = 10) {
  const experience = getExperience();
  if (!experience[guildId]) return [];
  
  return Object.entries(experience[guildId])
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.level - a.level || b.xp - a.xp)
    .slice(0, limit);
}

module.exports = {
  getUserExperience,
  addExperience,
  removeExperience,
  setLevel,
  getXpForNextLevel,
  getTopUsers
};

