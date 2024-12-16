const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getUserData, saveUserData, formatNumber } = require('../utils/helpers');
const pcComponents = require('../data/pc_components');

module.exports = {
  name: 'shopgamer',
  description: 'Compra componentes para tu PC',
  usage: 'c!shopgamer [componente] [modelo]',
  run: async (client, message, args) => {
    if (args.length === 0) {
      showShopCategories(message);
    } else if (args.length === 1) {
      showComponentList(message, args[0]);
    } else {
      buyComponent(message, args[0], args.slice(1).join(' '));
    }
  },
  data: new SlashCommandBuilder()
    .setName('shopgamer')
    .setDescription('Compra componentes para tu PC')
    .addStringOption(option =>
      option.setName('categoria')
        .setDescription('Categoría de componentes')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('modelo')
        .setDescription('Modelo específico del componente')
        .setRequired(false)),
  async execute(interaction) {
    const category = interaction.options.getString('categoria');
    const model = interaction.options.getString('modelo');

    if (!category) {
      showShopCategories(interaction);
    } else if (!model) {
      showComponentList(interaction, category);
    } else {
      buyComponent(interaction, category, model);
    }
  },
};

function showShopCategories(context) {
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('ShopGamer - Categorías')
    .setDescription('Selecciona una categoría para ver los componentes disponibles:')
    .addFields(
      Object.keys(pcComponents).map(category => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: `Usa \`c!shopgamer ${category}\` para ver los modelos disponibles.`
      }))
    );

  context.reply({ embeds: [embed] });
}

function showComponentList(context, category) {
  const components = pcComponents[category];
  if (!components) {
    return context.reply('Categoría no válida. Usa `c!shopgamer` para ver las categorías disponibles.');
  }

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`ShopGamer - ${category.charAt(0).toUpperCase() + category.slice(1)}`)
    .setDescription('Modelos disponibles:')
    .addFields(
      components.map(component => ({
        name: component.name,
        value: `Precio: U$S ${formatNumber(component.price)}\nUsa \`c!shopgamer ${category} ${component.name}\` para comprar.`
      }))
    );

  context.reply({ embeds: [embed] });
}

function buyComponent(context, category, model) {
  const userData = getUserData(context.author ? context.author.id : context.user.id);
  const components = pcComponents[category];
  if (!components) {
    return context.reply('Categoría no válida. Usa `c!shopgamer` para ver las categorías disponibles.');
  }

  const component = components.find(c => c.name.toLowerCase() === model.toLowerCase());
  if (!component) {
    return context.reply('Modelo no válido. Usa `c!shopgamer ${category}` para ver los modelos disponibles.');
  }

  if (userData.balance < component.price) {
    return context.reply(`No tienes suficiente dinero para comprar este componente. Necesitas U$S ${formatNumber(component.price)}.`);
  }

  userData.balance -= component.price;
  if (!userData.setup) userData.setup = {};
  userData.setup[category] = component;

  saveUserData({ [context.author ? context.author.id : context.user.id]: userData });

  context.reply(`Has comprado ${component.name} por U$S ${formatNumber(component.price)}. Tu nuevo balance es U$S ${formatNumber(userData.balance)}.`);
}

