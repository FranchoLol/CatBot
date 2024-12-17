const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const navigationButtons = require('../data/navigation_buttons');

function createNavigationRow(command) {
  const row = new ActionRowBuilder();
  const buttons = navigationButtons.buttons[command] || [];

  buttons.forEach(button => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(button.id)
        .setLabel(button.label)
        .setStyle(button.style)
    );
  });

  return row;
}

async function handleNavigationButton(interaction) {
  const buttonConfig = Object.values(navigationButtons.buttons)
    .flat()
    .find(b => b.id === interaction.customId);

  if (!buttonConfig) return;

  const command = interaction.client.commands.get(buttonConfig.command);
  if (!command) return;

  await command.execute(interaction);
}

module.exports = {
  createNavigationRow,
  handleNavigationButton
};

