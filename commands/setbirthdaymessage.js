const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getBirthdayChannelConfig } = require('../utils/helpers');

const birthdayConfigPath = path.join(__dirname, '..', 'data', 'birthdayConfig.json');

module.exports = {
  name: 'setbirthdaymessage',
  description: 'Establece el mensaje de cumpleaños personalizado',
  usage: 'c!setbirthdaymessage <mensaje>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const config = getBirthdayChannelConfig(message.guild.id);
    if (!config || !config.channelId) {
      return message.reply('Primero debes configurar un canal de cumpleaños con `c!setbirthdaychannel`.');
    }

    const messageContent = args.join(' ');
    config.message = messageContent;
    saveBirthdayConfig(message.guild.id, config);

    message.reply('Mensaje de cumpleaños personalizado establecido.');
  },
  data: new SlashCommandBuilder()
    .setName('setbirthdaymessage')
    .setDescription('Establece el mensaje de cumpleaños personalizado')
    .addStringOption(option =>
      option.setName('mensaje')
        .setDescription('El mensaje de cumpleaños personalizado')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const config = getBirthdayChannelConfig(interaction.guild.id);
    if (!config || !config.channelId) {
      return interaction.reply({ content: 'Primero debes configurar un canal de cumpleaños con `/setbirthdaychannel`.', ephemeral: true });
    }

    const messageContent = interaction.options.getString('mensaje');
    config.message = messageContent;
    saveBirthdayConfig(interaction.guild.id, config);

    interaction.reply('Mensaje de cumpleaños personalizado establecido.');
  },
};

function saveBirthdayConfig(guildId, config) {
  let allConfig = {};
  if (fs.existsSync(birthdayConfigPath)) {
    allConfig = JSON.parse(fs.readFileSync(birthdayConfigPath, 'utf8'));
  }
  allConfig[guildId] = config;
  fs.writeFileSync(birthdayConfigPath, JSON.stringify(allConfig, null, 2), 'utf8');
}

