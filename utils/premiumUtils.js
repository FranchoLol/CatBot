const fs = require('fs').promises;
const path = require('path');

const premiumFile = path.join(__dirname, '..', 'data', 'premium.json');

async function getPremiumServers() {
  try {
    const data = await fs.readFile(premiumFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function savePremiumServers(premiumServers) {
  await fs.writeFile(premiumFile, JSON.stringify(premiumServers, null, 2));
}

async function isPremium(guildId) {
  const premiumServers = await getPremiumServers();
  return !!premiumServers[guildId];
}

async function setPremium(guildId, isPremium, virtualName, virtualAvatar) {
  const premiumServers = await getPremiumServers();
  if (isPremium) {
    premiumServers[guildId] = {
      active: true,
      virtualName: virtualName || 'CatGold 🐈',
      virtualAvatar: virtualAvatar || 'https://example.com/catgold.png'
    };
  } else {
    delete premiumServers[guildId];
  }
  await savePremiumServers(premiumServers);
}

async function getPremiumSettings(guildId) {
  const premiumServers = await getPremiumServers();
  return premiumServers[guildId] || null;
}

module.exports = { getPremiumServers, savePremiumServers, isPremium, setPremium, getPremiumSettings };

