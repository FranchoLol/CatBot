const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const economyConfigPath = path.join(__dirname, '..', 'data', 'economyConfig.json');

function getEconomyConfig() {
  return JSON.parse(fs.readFileSync(economyConfigPath, 'utf8'));
}

function saveEconomyConfig(config) {
  fs.writeFileSync(economyConfigPath, JSON.stringify(config, null, 2), 'utf8');
}

module.exports = {
  viewConfig: {
    data: new SlashCommandBuilder()
      .setName('vieweconomyconfig')
      .setDescription('Muestra la configuración actual del sistema de economía'),
    async execute(interaction) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
      }

      const config = getEconomyConfig();
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Configuración del Sistema de Economía')
        .addFields(
          { name: 'Moneda predeterminada', value: config.defaultCurrency },
          { name: 'Balance inicial', value: config.startingBalance.toString() },
          { name: 'Recompensa diaria', value: config.dailyAmount.toString() },
          { name: 'Cooldown diario', value: `${config.dailyCooldown / 3600000} horas` },
          { name: 'Rango de trabajo', value: `${config.workAmount.min} - ${config.workAmount.max}` },
          { name: 'Cooldown de trabajo', value: `${config.workCooldown / 60000} minutos` },
          { name: 'Probabilidad de robo', value: `${config.robChance * 100}%` },
          { name: 'Porcentaje de robo', value: `${config.robPercentage * 100}%` },
          { name: 'Tasa de interés bancario', value: `${config.bankInterestRate * 100}%` },
          { name: 'Intervalo de interés', value: `${config.bankInterestInterval / 3600000} horas` },
          { name: 'Impuesto de transferencia', value: `${config.transferTax * 100}%` }
        );

      await interaction.reply({ embeds: [embed] });
    },
  },

  setConfig: {
    data: new SlashCommandBuilder()
      .setName('seteconomyconfig')
      .setDescription('Modifica la configuración del sistema de economía')
      .addStringOption(option =>
        option.setName('setting')
          .setDescription('La configuración que quieres modificar')
          .setRequired(true)
          .addChoices(
            { name: 'Moneda predeterminada', value: 'defaultCurrency' },
            { name: 'Balance inicial', value: 'startingBalance' },
            { name: 'Recompensa diaria', value: 'dailyAmount' },
            { name: 'Cooldown diario', value: 'dailyCooldown' },
            { name: 'Rango mínimo de trabajo', value: 'workAmountMin' },
            { name: 'Rango máximo de trabajo', value: 'workAmountMax' },
            { name: 'Cooldown de trabajo', value: 'workCooldown' },
            { name: 'Probabilidad de robo', value: 'robChance' },
            { name: 'Porcentaje de robo', value: 'robPercentage' },
            { name: 'Tasa de interés bancario', value: 'bankInterestRate' },
            { name: 'Intervalo de interés', value: 'bankInterestInterval' },
            { name: 'Impuesto de transferencia', value: 'transferTax' }
          ))
      .addStringOption(option =>
        option.setName('value')
          .setDescription('El nuevo valor para la configuración')
          .setRequired(true)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
      }

      const setting = interaction.options.getString('setting');
      const value = interaction.options.getString('value');
      const config = getEconomyConfig();

      switch (setting) {
        case 'defaultCurrency':
          config.defaultCurrency = value;
          break;
        case 'startingBalance':
        case 'dailyAmount':
          config[setting] = parseInt(value);
          break;
        case 'dailyCooldown':
        case 'workCooldown':
        case 'bankInterestInterval':
          config[setting] = parseInt(value) * 3600000; // Convert hours to milliseconds
          break;
        case 'workAmountMin':
          config.workAmount.min = parseInt(value);
          break;
        case 'workAmountMax':
          config.workAmount.max = parseInt(value);
          break;
        case 'robChance':
        case 'robPercentage':
        case 'bankInterestRate':
        case 'transferTax':
          config[setting] = parseFloat(value);
          break;
        default:
          return interaction.reply('Configuración no válida.');
      }

      saveEconomyConfig(config);
      await interaction.reply(`La configuración ${setting} ha sido actualizada a ${value}.`);
    },
  },

  addCurrency: {
    data: new SlashCommandBuilder()
      .setName('addcurrency')
      .setDescription('Añade una nueva moneda al sistema de economía')
      .addStringOption(option =>
        option.setName('name')
          .setDescription('El nombre de la nueva moneda')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('symbol')
          .setDescription('El símbolo de la nueva moneda')
          .setRequired(true)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
      }

      const name = interaction.options.getString('name');
      const symbol = interaction.options.getString('symbol');
      const config = getEconomyConfig();

      if (config.currencies.some(c => c.name === name)) {
        return interaction.reply('Esta moneda ya existe.');
      }

      config.currencies.push({ name, symbol });
      saveEconomyConfig(config);

      await interaction.reply(`La moneda ${name} (${symbol}) ha sido añadida al sistema.`);
    },
  },

  setExchangeRate: {
    data: new SlashCommandBuilder()
      .setName('setexchangerate')
      .setDescription('Establece la tasa de cambio entre dos monedas')
      .addStringOption(option =>
        option.setName('from')
          .setDescription('La moneda de origen')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('to')
          .setDescription('La moneda de destino')
          .setRequired(true))
      .addNumberOption(option =>
        option.setName('rate')
          .setDescription('La tasa de cambio')
          .setRequired(true)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
      }

      const fromCurrency = interaction.options.getString('from');
      const toCurrency = interaction.options.getString('to');
      const rate = interaction.options.getNumber('rate');
      const config = getEconomyConfig();

      if (!config.currencies.some(c => c.name === fromCurrency) || !config.currencies.some(c => c.name === toCurrency)) {
        return interaction.reply('Una de las monedas especificadas no existe.');
      }

      config.exchangeRates[`${fromCurrency}_to_${toCurrency}`] = rate;
      config.exchangeRates[`${toCurrency}_to_${fromCurrency}`] = 1 / rate;
      saveEconomyConfig(config);

      await interaction.reply(`La tasa de cambio de ${fromCurrency} a ${toCurrency} ha sido establecida en ${rate}.`);
    },
  },

  addShopItem: {
    data: new SlashCommandBuilder()
      .setName('addshopitem')
      .setDescription('Añade un nuevo item a la tienda')
      .addStringOption(option =>
        option.setName('name')
          .setDescription('El nombre del nuevo item')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('price')
          .setDescription('El precio del item')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('stock')
          .setDescription('El stock del item (-1 para ilimitado)')
          .setRequired(true)),
    async execute(interaction) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
      }

      const name = interaction.options.getString('name');
      const price = interaction.options.getInteger('price');
      const stock = interaction.options.getInteger('stock');
      const config = getEconomyConfig();

      if (config.shopItems.some(item => item.name === name)) {
        return interaction.reply('Este item ya existe en la tienda.');
      }

      config.shopItems.push({ name, price, stock });
      saveEconomyConfig(config);

      await interaction.reply(`El item ${name} ha sido añadido a la tienda con un precio de ${price} ${config.defaultCurrency} y un stock de ${stock === -1 ? 'ilimitado' : stock}.`);
    },
  },
};

