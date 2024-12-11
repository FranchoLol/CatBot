const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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

module.exports = {
  balance: {
    data: new SlashCommandBuilder()
      .setName('balance')
      .setDescription('Muestra tu balance actual'),
    async execute(interaction) {
      const { guildId, user } = interaction;
      const userData = getUserBalance(guildId, user.id);
      const config = getEconomyConfig();

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Balance de ${user.username}`)
        .addFields(
          { name: 'Billetera', value: `${userData.balance} ${config.defaultCurrency}`, inline: true },
          { name: 'Banco', value: `${userData.bank} ${config.defaultCurrency}`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    },
  },

  daily: {
    data: new SlashCommandBuilder()
      .setName('daily')
      .setDescription('Recibe tu recompensa diaria'),
    async execute(interaction) {
      const { guildId, user } = interaction;
      const userData = getUserBalance(guildId, user.id);
      const config = getEconomyConfig();
      const now = Date.now();

      if (now - userData.lastDaily < config.dailyCooldown) {
        const timeLeft = config.dailyCooldown - (now - userData.lastDaily);
        return interaction.reply(`Debes esperar ${Math.ceil(timeLeft / 3600000)} horas para tu próxima recompensa diaria.`);
      }

      userData.balance += config.dailyAmount;
      userData.lastDaily = now;
      saveEconomyData(getEconomyData());

      await interaction.reply(`Has recibido tu recompensa diaria de ${config.dailyAmount} ${config.defaultCurrency}!`);
    },
  },

  work: {
    data: new SlashCommandBuilder()
      .setName('work')
      .setDescription('Trabaja para ganar dinero'),
    async execute(interaction) {
      const { guildId, user } = interaction;
      const userData = getUserBalance(guildId, user.id);
      const config = getEconomyConfig();
      const now = Date.now();

      if (now - userData.lastWork < config.workCooldown) {
        const timeLeft = config.workCooldown - (now - userData.lastWork);
        return interaction.reply(`Debes esperar ${Math.ceil(timeLeft / 60000)} minutos antes de volver a trabajar.`);
      }

      const earned = Math.floor(Math.random() * (config.workAmount.max - config.workAmount.min + 1)) + config.workAmount.min;
      userData.balance += earned;
      userData.lastWork = now;
      saveEconomyData(getEconomyData());

      await interaction.reply(`Has trabajado duro y ganado ${earned} ${config.defaultCurrency}!`);
    },
  },

  rob: {
    data: new SlashCommandBuilder()
      .setName('rob')
      .setDescription('Intenta robar a otro usuario')
      .addUserOption(option => 
        option.setName('target')
          .setDescription('El usuario al que intentas robar')
          .setRequired(true)),
    async execute(interaction) {
      const { guildId, user } = interaction;
      const target = interaction.options.getUser('target');
      if (target.id === user.id) return interaction.reply('No puedes robarte a ti mismo.');

      const userData = getUserBalance(guildId, user.id);
      const targetData = getUserBalance(guildId, target.id);
      const config = getEconomyConfig();

      if (Math.random() > config.robChance) {
        return interaction.reply('Has sido atrapado intentando robar. Mejor suerte la próxima vez.');
      }

      const stolenAmount = Math.floor(targetData.balance * config.robPercentage);
      userData.balance += stolenAmount;
      targetData.balance -= stolenAmount;
      saveEconomyData(getEconomyData());

      await interaction.reply(`Has robado exitosamente ${stolenAmount} ${config.defaultCurrency} de ${target.username}!`);
    },
  },

  deposit: {
    data: new SlashCommandBuilder()
      .setName('deposit')
      .setDescription('Deposita dinero en el banco')
      .addIntegerOption(option => 
        option.setName('amount')
          .setDescription('La cantidad a depositar')
          .setRequired(true)),
    async execute(interaction) {
      const { guildId, user } = interaction;
      const amount = interaction.options.getInteger('amount');
      const userData = getUserBalance(guildId, user.id);
      const config = getEconomyConfig();

      if (amount <= 0) return interaction.reply('La cantidad debe ser positiva.');
      if (amount > userData.balance) return interaction.reply('No tienes suficiente dinero en tu billetera.');

      userData.balance -= amount;
      userData.bank += amount;
      saveEconomyData(getEconomyData());

      await interaction.reply(`Has depositado ${amount} ${config.defaultCurrency} en tu cuenta bancaria.`);
    },
  },

  withdraw: {
    data: new SlashCommandBuilder()
      .setName('withdraw')
      .setDescription('Retira dinero del banco')
      .addIntegerOption(option => 
        option.setName('amount')
          .setDescription('La cantidad a retirar')
          .setRequired(true)),
    async execute(interaction) {
      const { guildId, user } = interaction;
      const amount = interaction.options.getInteger('amount');
      const userData = getUserBalance(guildId, user.id);
      const config = getEconomyConfig();

      if (amount <= 0) return interaction.reply('La cantidad debe ser positiva.');
      if (amount > userData.bank) return interaction.reply('No tienes suficiente dinero en tu cuenta bancaria.');

      userData.balance += amount;
      userData.bank -= amount;
      saveEconomyData(getEconomyData());

      await interaction.reply(`Has retirado ${amount} ${config.defaultCurrency} de tu cuenta bancaria.`);
    },
  },

  transfer: {
    data: new SlashCommandBuilder()
      .setName('transfer')
      .setDescription('Transfiere dinero a otro usuario')
      .addUserOption(option => 
        option.setName('target')
          .setDescription('El usuario al que quieres transferir dinero')
          .setRequired(true))
      .addIntegerOption(option => 
        option.setName('amount')
          .setDescription('La cantidad a transferir')
          .setRequired(true)),
    async execute(interaction) {
      const { guildId, user } = interaction;
      const target = interaction.options.getUser('target');
      const amount = interaction.options.getInteger('amount');
      const userData = getUserBalance(guildId, user.id);
      const targetData = getUserBalance(guildId, target.id);
      const config = getEconomyConfig();

      if (target.id === user.id) return interaction.reply('No puedes transferirte dinero a ti mismo.');
      if (amount <= 0) return interaction.reply('La cantidad debe ser positiva.');
      if (amount > userData.balance) return interaction.reply('No tienes suficiente dinero en tu billetera.');

      const tax = Math.floor(amount * config.transferTax);
      const transferAmount = amount - tax;

      userData.balance -= amount;
      targetData.balance += transferAmount;
      saveEconomyData(getEconomyData());

      await interaction.reply(`Has transferido ${transferAmount} ${config.defaultCurrency} a ${target.username}. Se aplicó un impuesto de ${tax} ${config.defaultCurrency}.`);
    },
  },

  shop: {
    data: new SlashCommandBuilder()
      .setName('shop')
      .setDescription('Muestra los items disponibles en la tienda'),
    async execute(interaction) {
      const config = getEconomyConfig();
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Tienda')
        .setDescription('Estos son los items disponibles para comprar:');

      for (const item of config.shopItems) {
        embed.addFields({ name: item.name, value: `Precio: ${item.price} ${config.defaultCurrency}\nStock: ${item.stock === -1 ? 'Ilimitado' : item.stock}`, inline: true });
      }

      await interaction.reply({ embeds: [embed] });
    },
  },

  buy: {
    data: new SlashCommandBuilder()
      .setName('buy')
      .setDescription('Compra un item de la tienda')
      .addStringOption(option => 
        option.setName('item')
          .setDescription('El nombre del item que quieres comprar')
          .setRequired(true))
      .addIntegerOption(option => 
        option.setName('quantity')
          .setDescription('La cantidad que quieres comprar')
          .setRequired(false)),
    async execute(interaction) {
      const { guildId, user } = interaction;
      const itemName = interaction.options.getString('item');
      const quantity = interaction.options.getInteger('quantity') || 1;
      const userData = getUserBalance(guildId, user.id);
      const config = getEconomyConfig();

      const item = config.shopItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
      if (!item) return interaction.reply('Ese item no existe en la tienda.');

      const totalCost = item.price * quantity;
      if (userData.balance < totalCost) return interaction.reply('No tienes suficiente dinero para comprar este item.');

      if (item.stock !== -1) {
        if (item.stock < quantity) return interaction.reply('No hay suficiente stock de este item.');
        item.stock -= quantity;
      }

      userData.balance -= totalCost;
      for (let i = 0; i < quantity; i++) {
        userData.inventory.push(item.name);
      }
      saveEconomyData(getEconomyData());

      await interaction.reply(`Has comprado ${quantity} ${item.name} por ${totalCost} ${config.defaultCurrency}.`);
    },
  },

  inventory: {
    data: new SlashCommandBuilder()
      .setName('inventory')
      .setDescription('Muestra tu inventario'),
    async execute(interaction) {
      const { guildId, user } = interaction;
      const userData = getUserBalance(guildId, user.id);
      const config = getEconomyConfig();

      const inventoryCounts = userData.inventory.reduce((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      }, {});

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Inventario de ${user.username}`)
        .setDescription('Estos son los items en tu inventario:');

      for (const [item, count] of Object.entries(inventoryCounts)) {
        embed.addFields({ name: item, value: `Cantidad: ${count}`, inline: true });
      }

      await interaction.reply({ embeds: [embed] });
    },
  },
  addMoney: {
    data: new SlashCommandBuilder()
      .setName('addmoney')
      .setDescription('Añade dinero a un usuario (Solo para administradores)')
      .addUserOption(option => 
        option.setName('user')
          .setDescription('El usuario al que quieres añadir dinero')
          .setRequired(true))
      .addIntegerOption(option => 
        option.setName('amount')
          .setDescription('La cantidad de dinero a añadir')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('currency')
          .setDescription('La moneda a añadir')
          .setRequired(false)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
      }

      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      const currency = interaction.options.getString('currency') || getEconomyConfig().defaultCurrency;
      const userData = getUserBalance(interaction.guildId, target.id);
      const config = getEconomyConfig();

      if (!config.currencies.some(c => c.name === currency)) {
        return interaction.reply(`La moneda ${currency} no existe.`);
      }

      if (currency === config.defaultCurrency) {
        userData.balance += amount;
      } else {
        userData[currency] = (userData[currency] || 0) + amount;
      }
      saveEconomyData(getEconomyData());

      await interaction.reply(`Se han añadido ${amount} ${currency} a la cuenta de ${target.username}.`);
    },
  },

  removeMoney: {
    data: new SlashCommandBuilder()
      .setName('removemoney')
      .setDescription('Quita dinero a un usuario (Solo para administradores)')
      .addUserOption(option => 
        option.setName('user')
          .setDescription('El usuario al que quieres quitar dinero')
          .setRequired(true))
      .addIntegerOption(option => 
        option.setName('amount')
          .setDescription('La cantidad de dinero a quitar')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('currency')
          .setDescription('La moneda a quitar')
          .setRequired(false)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
      }

      const target = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      const currency = interaction.options.getString('currency') || getEconomyConfig().defaultCurrency;
      const userData = getUserBalance(interaction.guildId, target.id);
      const config = getEconomyConfig();

      if (!config.currencies.some(c => c.name === currency)) {
        return interaction.reply(`La moneda ${currency} no existe.`);
      }

      if (currency === config.defaultCurrency) {
        if (userData.balance < amount) {
          return interaction.reply(`${target.username} no tiene suficiente ${currency} para quitar.`);
        }
        userData.balance -= amount;
      } else {
        if (!userData[currency] || userData[currency] < amount) {
          return interaction.reply(`${target.username} no tiene suficiente ${currency} para quitar.`);
        }
        userData[currency] -= amount;
      }
      saveEconomyData(getEconomyData());

      await interaction.reply(`Se han quitado ${amount} ${currency} de la cuenta de ${target.username}.`);
    },
  },

  exchange: {
    data: new SlashCommandBuilder()
      .setName('exchange')
      .setDescription('Cambia una moneda por otra')
      .addStringOption(option =>
        option.setName('from')
          .setDescription('La moneda que quieres cambiar')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('to')
          .setDescription('La moneda que quieres obtener')
          .setRequired(true))
      .addIntegerOption(option => 
        option.setName('amount')
          .setDescription('La cantidad que quieres cambiar')
          .setRequired(true)),
    async execute(interaction) {
      const fromCurrency = interaction.options.getString('from');
      const toCurrency = interaction.options.getString('to');
      const amount = interaction.options.getInteger('amount');
      const { guildId, user } = interaction;
      const userData = getUserBalance(guildId, user.id);
      const config = getEconomyConfig();

      if (!config.currencies.some(c => c.name === fromCurrency) || !config.currencies.some(c => c.name === toCurrency)) {
        return interaction.reply('Una de las monedas especificadas no existe.');
      }

      const exchangeRate = config.exchangeRates[`${fromCurrency}_to_${toCurrency}`];
      if (!exchangeRate) {
        return interaction.reply('No hay una tasa de cambio definida para estas monedas.');
      }

      if (fromCurrency === config.defaultCurrency) {
        if (userData.balance < amount) {
          return interaction.reply(`No tienes suficiente ${fromCurrency} para hacer este cambio.`);
        }
        userData.balance -= amount;
      } else {
        if (!userData[fromCurrency] || userData[fromCurrency] < amount) {
          return interaction.reply(`No tienes suficiente ${fromCurrency} para hacer este cambio.`);
        }
        userData[fromCurrency] -= amount;
      }

      const convertedAmount = Math.floor(amount * exchangeRate);
      if (toCurrency === config.defaultCurrency) {
        userData.balance += convertedAmount;
      } else {
        userData[toCurrency] = (userData[toCurrency] || 0) + convertedAmount;
      }

      saveEconomyData(getEconomyData());

      await interaction.reply(`Has cambiado ${amount} ${fromCurrency} por ${convertedAmount} ${toCurrency}.`);
    },
  },
};
