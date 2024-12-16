const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const navigationButtons = require('../data/navigation_buttons');

function createNavigationRow() {
  const row = new ActionRowBuilder();
  
  navigationButtons.buttons.forEach(button => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(button.id)
        .setLabel(button.label)
        .setStyle(ButtonStyle.Secondary)
    );
  });

  return row;
}

function handleNavigationButton(interaction) {
  const buttonConfig = navigationButtons.buttons.find(b => b.id === interaction.customId);
  if (!buttonConfig) return;

  // Ejecutar el comando correspondiente
  const command = interaction.client.commands.get(buttonConfig.command);
  if (!command) return;

  command.execute(interaction);
}

module.exports = {
  createNavigationRow,
  handleNavigationButton
};

