const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'data', 'welcome_config.json');

function getConfig() {
  if (!fs.existsSync(configPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = {
  name: 'welcomechannel',
  description: 'Establece el canal de bienvenida',
  usage: 'c!welcomechannel [#canal/id]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) {
      return message.reply('Por favor, menciona o proporciona la ID de un canal válido.');
    }

    const config = getConfig();
    if (!config[message.guild.id]) config[message.guild.id] = {};
    config[message.guild.id].welcomeChannel = channel.id;
    saveConfig(config);

    message.reply(`El canal de bienvenida ha sido establecido en ${channel}.`);
  },
  data: new SlashCommandBuilder()
    .setName('welcomechannel')
    .setDescription('Establece el canal de bienvenida')
    .addChannelOption(option => 
      option.setName('canal')
        .setDescription('El canal de bienvenida')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('canal');

    const config = getConfig();
    if (!config[interaction.guild.id]) config[interaction.guild.id] = {};
    config[interaction.guild.id].welcomeChannel = channel.id;
    saveConfig(config);

    interaction.reply(`El canal de bienvenida ha sido establecido en ${channel}.`);
  },
};

