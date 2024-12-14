const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warnConfigPath = path.join(__dirname, '..', 'data', 'warnConfig.json');

function getWarnConfig() {
  if (!fs.existsSync(warnConfigPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(warnConfigPath, 'utf8'));
}

function saveWarnConfig(config) {
  fs.writeFileSync(warnConfigPath, JSON.stringify(config, null, 2), 'utf8');
}

module.exports = {
  name: 'warnconfigmax',
  description: 'Establece el número máximo de advertencias antes de tomar acción',
  usage: 'c!warnconfigmax <número>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const maxWarns = parseInt(args[0]);
    if (isNaN(maxWarns) || maxWarns < 1) {
      return message.reply('Por favor, proporciona un número válido mayor que 0.');
    }

    const config = getWarnConfig();
    if (!config[message.guild.id]) config[message.guild.id] = {};
    config[message.guild.id].maxWarns = maxWarns;
    saveWarnConfig(config);

    message.reply(`El número máximo de advertencias se ha establecido en ${maxWarns}.`);
  },
  data: new SlashCommandBuilder()
    .setName('warnconfigmax')
    .setDescription('Establece el número máximo de advertencias antes de tomar acción')
    .addIntegerOption(option =>
      option.setName('numero')
        .setDescription('El número máximo de advertencias')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const maxWarns = interaction.options.getInteger('numero');
    if (maxWarns < 1) {
      return interaction.reply({ content: 'Por favor, proporciona un número válido mayor que 0.', ephemeral: true });
    }

    const config = getWarnConfig();
    if (!config[interaction.guild.id]) config[interaction.guild.id] = {};
    config[interaction.guild.id].maxWarns = maxWarns;
    saveWarnConfig(config);

    interaction.reply(`El número máximo de advertencias se ha establecido en ${maxWarns}.`);
  },
};

