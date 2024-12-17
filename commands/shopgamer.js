const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUserData, saveUserData, formatNumber } = require('../utils/helpers');
const pcComponents = require('../data/pc_components');
const { createNavigationRow } = require('../utils/button_handler');

module.exports = {
  name: 'shopgamer',
  description: 'Compra componentes para tu PC',
  usage: 'c!shopgamer [componente] [modelo]',
  run: async (client, message, args) => {
    const embed = await showShopCategories(message.author);
    message.reply({ embeds: [embed], components: createShopButtons() });
  },
  data: new SlashCommandBuilder()
    .setName('shopgamer')
    .setDescription('Compra componentes para tu PC'),
  async execute(interaction) {
    if (interaction.isButton()) {
      const [action, category, model] = interaction.customId.split('_');
      if (action === 'category') {
        const embed = await showComponentList(interaction.user, category);
        await interaction.update({ embeds: [embed], components: createComponentButtons(category) });
      } else if (action === 'buy') {
        await buyComponent(interaction, category, model);
      } else if (action === 'back') {
        const embed = await showShopCategories(interaction.user);
        await interaction.update({ embeds: [embed], components: createShopButtons() });
      }
    } else {
      const embed = await showShopCategories(interaction.user);
      await interaction.reply({ embeds: [embed], components: createShopButtons() });
    }
  },
};

async function showShopCategories(user) {
  const userData = getUserData(user.id);
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('ShopGamer - Categorías')
    .setDescription('Selecciona una categoría para ver los componentes disponibles:')
    .addFields(
      Object.keys(pcComponents).map(category => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: `Usa los botones para ver los modelos disponibles.`
      }))
    )
    .setFooter({ text: `Balance actual: U$S ${formatNumber(userData.balance)}` });

  return embed;
}

function createShopButtons() {
  const rows = [];
  const categories = Object.keys(pcComponents);
  for (let i = 0; i < categories.length; i += 5) {
    const row = new ActionRowBuilder();
    categories.slice(i, i + 5).forEach(category => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`category_${category}`)
          .setLabel(category.charAt(0).toUpperCase() + category.slice(1))
          .setStyle(ButtonStyle.Primary)
      );
    });
    rows.push(row);
  }

  rows.push(createNavigationRow('shop'));
  return rows;
}

async function showComponentList(user, category) {
  const userData = getUserData(user.id);
  const components = pcComponents[category];
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`ShopGamer - ${category.charAt(0).toUpperCase() + category.slice(1)}`)
    .setDescription('Modelos disponibles:')
    .addFields(
      components.map(component => ({
        name: component.name,
        value: `Precio: U$S ${formatNumber(component.price)}`
      }))
    )
    .setFooter({ text: `Balance actual: U$S ${formatNumber(userData.balance)}` });

  return embed;
}

function createComponentButtons(category) {
  const components = pcComponents[category];
  const rows = [];
  for (let i = 0; i < components.length; i += 5) {
    const row = new ActionRowBuilder();
    components.slice(i, i + 5).forEach(component => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`buy_${category}_${component.name}`)
          .setLabel(`${component.name}`)
          .setStyle(ButtonStyle.Secondary)
      );
    });
    rows.push(row);
  }

  const backButton = new ButtonBuilder()
    .setCustomId('back_to_categories')
    .setLabel('Volver a categorías')
    .setStyle(ButtonStyle.Danger);

  rows.push(new ActionRowBuilder().addComponents(backButton));
  rows.push(createNavigationRow('shop'));
  return rows;
}

async function buyComponent(interaction, category, model) {
  const userData = getUserData(interaction.user.id);
  const components = pcComponents[category];
  const component = components.find(c => c.name === model);

  if (!component) {
    return interaction.reply({ content: 'Modelo no válido.', ephemeral: true });
  }

  if (userData.balance < component.price) {
    return interaction.reply({ content: `No tienes suficiente dinero para comprar este componente. Necesitas U$S ${formatNumber(component.price)}.`, ephemeral: true });
  }

  userData.balance -= component.price;
  if (!userData.setup) userData.setup = {};
  userData.setup[category] = component;

  saveUserData({ [interaction.user.id]: userData });

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle(`Compra Exitosa`)
    .setDescription(`Has comprado ${component.name} por U$S ${formatNumber(component.price)}. Tu nuevo balance es U$S ${formatNumber(userData.balance)}.`);

  await interaction.update({ embeds: [embed], components: [] });

  // Enviar un nuevo mensaje después de 3 segundos con la lista de componentes actualizada
  setTimeout(async () => {
    const updatedEmbed = await showComponentList(interaction.user, category);
    await interaction.editReply({ embeds: [updatedEmbed], components: createComponentButtons(category) });
  }, 3000);
}

