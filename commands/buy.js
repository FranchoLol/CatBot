const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserBalance, updateUserBalance, addItemToInventory, getShopItems, updateShopItemStock, getEconomyConfig } = require('../utils/economyUtils');

module.exports = {
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

    const item = getShopItems().find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (!item) return interaction.reply('Ese item no existe en la tienda.');

    const totalCost = item.price * quantity;
    if (userData.balance < totalCost) return interaction.reply('No tienes suficiente dinero para comprar este item.');

    if (item.stock !== -1) {
      if (item.stock < quantity) return interaction.reply('No hay suficiente stock de este item.');
      updateShopItemStock(item.name, item.stock - quantity);
    }

    updateUserBalance(guildId, user.id, -totalCost);
    for (let i = 0; i < quantity; i++) {
      addItemToInventory(guildId, user.id, item.name);
    }

    await interaction.reply(`Has comprado ${quantity} ${item.name} por ${totalCost} ${config.defaultCurrency}.`);
  },
};

