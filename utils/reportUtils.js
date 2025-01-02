const fs = require('fs').promises;
const path = require('path');

const cooldownsPath = path.join(__dirname, '..', 'data', 'cooldowns.json');

async function getCooldowns() {
  try {
    const data = await fs.readFile(cooldownsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function saveCooldowns(cooldowns) {
  await fs.writeFile(cooldownsPath, JSON.stringify(cooldowns, null, 2));
}

async function checkCooldown(userId, commandType) {
  const cooldowns = await getCooldowns();
  const now = Date.now();
  const cooldownTime = 4 * 60 * 60 * 1000; // 4 horas en milisegundos

  if (!cooldowns[userId]) {
    cooldowns[userId] = {};
  }

  if (cooldowns[userId][commandType] && now - cooldowns[userId][commandType] < cooldownTime) {
    const timeLeft = (cooldowns[userId][commandType] + cooldownTime - now) / 1000 / 60; // tiempo restante en minutos
    return Math.ceil(timeLeft);
  }

  cooldowns[userId][commandType] = now;
  await saveCooldowns(cooldowns);
  return 0;
}

function isValidContent(content) {
  // Verificar que el contenido no esté vacío y tenga al menos 10 caracteres
  if (!content || content.trim().length < 10) {
    return false;
  }

  // Verificar que el contenido no sea solo caracteres repetidos o aleatorios
  const repeatedChars = /(.)\1{4,}/;
  const randomChars = /^[a-zA-Z]{10,}$/;
  if (repeatedChars.test(content) || randomChars.test(content)) {
    return false;
  }

  return true;
}

async function getReportCount() {
  const cooldowns = await getCooldowns();
  return cooldowns.reportCount || 0;
}

async function getSuggestionCount() {
  const cooldowns = await getCooldowns();
  return cooldowns.suggestionCount || 0;
}

async function incrementReportCount() {
  const cooldowns = await getCooldowns();
  cooldowns.reportCount = (cooldowns.reportCount || 0) + 1;
  await saveCooldowns(cooldowns);
  return cooldowns.reportCount;
}

async function incrementSuggestionCount() {
  const cooldowns = await getCooldowns();
  cooldowns.suggestionCount = (cooldowns.suggestionCount || 0) + 1;
  await saveCooldowns(cooldowns);
  return cooldowns.suggestionCount;
}

module.exports = { checkCooldown, isValidContent, getReportCount, getSuggestionCount, incrementReportCount, incrementSuggestionCount };

