const fs = require('fs');
const path = require('path');

const economyDataPath = path.join(__dirname, '..', 'data', 'economy.json');
const economyConfigPath = path.join(__dirname, '..', 'data', 'economyConfig.json');

function getEconomyData() {
  if (!fs.existsSync(economyDataPath)) {
    fs.writeFileSync(economyDataPath, '{}', 'utf8');
    return {};
  }
  return JSON.parse(fs.readFileSync(economyDataPath, 'utf8'));
}

function saveEconomyData(data) {
  fs.writeFileSync(economyDataPath, JSON.stringify(data, null, 2), 'utf8');
}

function getEconomyConfig() {
  return JSON.parse(fs.readFileSync(economyConfigPath, 'utf8'));
}

function getUserBalance(guildId, userId) {
  const economyData = getEconomyData();
  if (!economyData[guildId]) economyData[guildId] = {};
  if (!economyData[guildId][userId]) {
    const config = getEconomyConfig();
    economyData[guildId][userId] = {
      balance: config.startingBalance,
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      inventory: []
    };
    saveEconomyData(economyData);
  }
  return economyData[guildId][userId];
}

function updateUserBalance(guildId, userId, amount, type = 'balance') {
  const economyData = getEconomyData();
  const userData = getUserBalance(guildId, userId);
  userData[type] += amount;
  economyData[guildId][userId] = userData;
  saveEconomyData(economyData);
  return userData;
}

function transferMoney(guildId, fromUserId, toUserId, amount) {
  const economyData = getEconomyData();
  const fromUser = getUserBalance(guildId, fromUserId);
  const toUser = getUserBalance(guildId, toUserId);
  const config = getEconomyConfig();

  if (fromUser.balance < amount) return false;

  const tax = Math.floor(amount * config.transferTax);
  const transferAmount = amount - tax;

  fromUser.balance -= amount;
  toUser.balance += transferAmount;

  economyData[guildId][fromUserId] = fromUser;
  economyData[guildId][toUserId] = toUser;
  saveEconomyData(economyData);

  return { success: true, tax, transferAmount };
}

function addItemToInventory(guildId, userId, itemName) {
  const economyData = getEconomyData();
  const userData = getUserBalance(guildId, userId);
  userData.inventory.push(itemName);
  economyData[guildId][userId] = userData;
  saveEconomyData(economyData);
}

function removeItemFromInventory(guildId, userId, itemName) {
  const economyData = getEconomyData();
  const userData = getUserBalance(guildId, userId);
  const index = userData.inventory.indexOf(itemName);
  if (index > -1) {
    userData.inventory.splice(index, 1);
    economyData[guildId][userId] = userData;
    saveEconomyData(economyData);
    return true;
  }
  return false;
}

function getShopItems() {
  const config = getEconomyConfig();
  return config.shopItems;
}

function updateShopItemStock(itemName, newStock) {
  const config = getEconomyConfig();
  const itemIndex = config.shopItems.findIndex(item => item.name === itemName);
  if (itemIndex > -1) {
    config.shopItems[itemIndex].stock = newStock;
    fs.writeFileSync(economyConfigPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  }
  return false;
}

module.exports = {
  getEconomyData,
  saveEconomyData,
  getEconomyConfig,
  getUserBalance,
  updateUserBalance,
  transferMoney,
  addItemToInventory,
  removeItemFromInventory,
  getShopItems,
  updateShopItemStock
};

