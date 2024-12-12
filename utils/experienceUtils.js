const fs = require('fs');
const path = require('path');

const experiencePath = path.join(__dirname, '..', 'data', 'experience.json');
const levelConfigPath = path.join(__dirname, '..', 'data', 'levelConfig.json');
const levelChannelConfigPath = path.join(__dirname, '..', 'data', 'levelChannelConfig.json');

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
  if (!experience[guildId][userId]) experience[guildId][userId] = { xp: 0, level: 0, lastXpCommand: 0 };
  return experience[guildId][userId];
}

function setUserExperience(guildId, userId, xp, level, lastXpCommand) {
  const experience = getExperience();
  if (!experience[guildId]) experience[guildId] = {};
  experience[guildId][userId] = { xp, level, lastXpCommand };
  saveExperience(experience);
}

function addExperience(guildId, userId, xp) {
  const userExp = getUserExperience(guildId, userId);
  const oldLevel = userExp.level;
  userExp.xp += xp;
  while (userExp.xp >= getXpForNextLevel(userExp.level)) {
    userExp.xp -= getXpForNextLevel(userExp.level);
    userExp.level++;
  }
  setUserExperience(guildId, userId, userExp.xp, userExp.level, userExp.lastXpCommand);
  return { ...userExp, leveledUp: userExp.level > oldLevel };
}

function removeExperience(guildId, userId, xp) {
  const userExp = getUserExperience(guildId, userId);
  userExp.xp = Math.max(0, userExp.xp - xp);
  while (userExp.level > 0 && userExp.xp < getXpForNextLevel(userExp.level - 1)) {
    userExp.level--;
    userExp.xp += getXpForNextLevel(userExp.level);
  }
  setUserExperience(guildId, userId, userExp.xp, userExp.level, userExp.lastXpCommand);
  return userExp;
}

function setLevel(guildId, userId, level, xp) {
  const userExp = getUserExperience(guildId, userId);
  userExp.level = level;
  userExp.xp = xp !== undefined ? xp : userExp.xp;
  setUserExperience(guildId, userId, userExp.xp, userExp.level, userExp.lastXpCommand);
  return userExp;
}

function getXpForNextLevel(level) {
  return 100 * (level + 1);
}

function getTopUsers(guildId, limit = 10) {
  const experience = getExperience();
  if (!experience[guildId]) return [];
  
  return Object.entries(experience[guildId])
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.level - a.level || b.xp - a.xp)
    .slice(0, limit);
}

function addMessageExperience(guildId, userId, messageLength) {
  const config = getLevelConfig();
  const xpToAdd = getMessageXP(messageLength, config.messageLengthXP);
  return addExperience(guildId, userId, xpToAdd);
}

function getMessageXP(messageLength, messageLengthXP) {
  for (const range of messageLengthXP) {
    if (messageLength >= range.minLength && messageLength <= range.maxLength) {
      return range.xp;
    }
  }
  return 0;
}

function getLevelConfig() {
  if (!fs.existsSync(levelConfigPath)) {
    const defaultConfig = {
      xpRanges: [
        { minLevel: 0, maxLevel: 10, minXP: 5, maxXP: 10 },
        { minLevel: 11, maxLevel: 20, minXP: 10, maxXP: 20 },
        { minLevel: 21, maxLevel: 30, minXP: 15, maxXP: 30 },
        { minLevel: 31, maxLevel: 40, minXP: 20, maxXP: 40 },
        { minLevel: 41, maxLevel: 50, minXP: 25, maxXP: 50 }
      ],
      messageLengthXP: [
        { minLength: 1, maxLength: 50, xp: 1 },
        { minLength: 51, maxLength: 100, xp: 2 },
        { minLength: 101, maxLength: 200, xp: 3 },
        { minLength: 201, maxLength: 300, xp: 4 },
        { minLength: 301, maxLength: Infinity, xp: 5 }
      ],
      xpCommandCooldown: 86400000,
      levels: [
        { level: 0, xpRequired: 0 },
        { level: 1, xpRequired: 100 },
        { level: 2, xpRequired: 255 },
        { level: 3, xpRequired: 475 },
        { level: 4, xpRequired: 770 },
        { level: 5, xpRequired: 1150 }
      ]
    };
    fs.writeFileSync(levelConfigPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
    return defaultConfig;
  }
  return JSON.parse(fs.readFileSync(levelConfigPath, 'utf8'));
}

function canUseXpCommand(guildId, userId) {
  const userExp = getUserExperience(guildId, userId);
  const config = getLevelConfig();
  const now = Date.now();
  return now - userExp.lastXpCommand >= config.xpCommandCooldown;
}

function useXpCommand(guildId, userId) {
  const userExp = getUserExperience(guildId, userId);
  const config = getLevelConfig();
  const xpToAdd = Math.floor(Math.random() * (config.xpRanges[0].maxXP - config.xpRanges[0].minXP + 1)) + config.xpRanges[0].minXP;
  userExp.xp += xpToAdd;
  userExp.lastXpCommand = Date.now();
  while (userExp.xp >= getXpForNextLevel(userExp.level)) {
    userExp.xp -= getXpForNextLevel(userExp.level);
    userExp.level++;
  }
  setUserExperience(guildId, userId, userExp.xp, userExp.level, userExp.lastXpCommand);
  return { xpAdded: xpToAdd, newXp: userExp.xp, newLevel: userExp.level };
}

function getRemainingCooldown(guildId, userId) {
  const userExp = getUserExperience(guildId, userId);
  const config = getLevelConfig();
  const now = Date.now();
  const timeSinceLastUse = now - userExp.lastXpCommand;
  return Math.max(0, config.xpCommandCooldown - timeSinceLastUse);
}

function getLevelChannelConfig(guildId) {
  if (!fs.existsSync(levelChannelConfigPath)) {
    return {};
  }
  const config = JSON.parse(fs.readFileSync(levelChannelConfigPath, 'utf8'));
  return config[guildId] || {};
}

function setLevelChannelConfig(guildId, channelId, message) {
  let config = {};
  if (fs.existsSync(levelChannelConfigPath)) {
    config = JSON.parse(fs.readFileSync(levelChannelConfigPath, 'utf8'));
  }
  config[guildId] = { channelId, message };
  fs.writeFileSync(levelChannelConfigPath, JSON.stringify(config, null, 2), 'utf8');
}

function removeLevelChannelConfig(guildId) {
  if (fs.existsSync(levelChannelConfigPath)) {
    const config = JSON.parse(fs.readFileSync(levelChannelConfigPath, 'utf8'));
    delete config[guildId];
    fs.writeFileSync(levelChannelConfigPath, JSON.stringify(config, null, 2), 'utf8');
  }
}

module.exports = {
  getUserExperience,
  addExperience,
  removeExperience,
  setLevel,
  getXpForNextLevel,
  getTopUsers,
  addMessageExperience,
  getMessageXP,
  getLevelConfig,
  canUseXpCommand,
  useXpCommand,
  getRemainingCooldown,
  getLevelChannelConfig,
  setLevelChannelConfig,
  removeLevelChannelConfig,
};

