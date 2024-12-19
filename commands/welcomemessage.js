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
  name: 'welcomemessage',
  description: 'Establece el mensaje de bienvenida',
  usage: 'c!welcomemessage [say/embed] [color] [title] [hora: true/false] [mensaje]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const fullCommand = args.join(' ');
    const match = fullCommand.match(/^(say|embed)\s+(#[0-9A-Fa-f]{6})\s+(.+?)\s+(true|false)\s+(.+)$/);

    if (!match) {
      return message.reply('Uso correcto: c!welcomemessage [say/embed] [color] [title] [hora: true/false] [mensaje]');
    }

    const [, type, color, title, showTime, content] = match;

    const config = getConfig();
    if (!config[message.guild.id]) config[message.guild.id] = {};
    
    config[message.guild.id].welcomeMessage = {
      type,
      color,
      title,
      showTime: showTime === 'true',
      content
    };

    saveConfig(config);

    message.reply('El mensaje de bienvenida ha sido configurado.');
  },
  data: new SlashCommandBuilder()
    .setName('welcomemessage')
    .setDescription('Establece el mensaje de bienvenida')
    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('Tipo de mensaje (say/embed)')
        .setRequired(true)
        .addChoices(
          { name: 'Mensaje normal', value: 'say' },
          { name: 'Mensaje embed', value: 'embed' }
        ))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Color del embed (formato hexadecimal)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('titulo')
        .setDescription('Título del mensaje')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('mostrar_hora')
        .setDescription('Mostrar hora en el footer del embed')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('mensaje')
        .setDescription('El mensaje de bienvenida')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const type = interaction.options.getString('tipo');
    const color = interaction.options.getString('color');
    const title = interaction.options.getString('titulo');
    const showTime = interaction.options.getBoolean('mostrar_hora');
    const content = interaction.options.getString('mensaje');

    const config = getConfig();
    if (!config[interaction.guild.id]) config[interaction.guild.id] = {};

    config[interaction.guild.id].welcomeMessage = {
      type,
      color,
      title,
      showTime,
      content
    };

    saveConfig(config);

    interaction.reply('El mensaje de bienvenida ha sido configurado.');
  },
};

