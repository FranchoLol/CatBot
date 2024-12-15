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

    if (args.length < 2) {
      return message.reply('Uso correcto: c!welcomemessage [say/embed] [color] [title] [hora: true/false] [mensaje]');
    }

    const type = args[0].toLowerCase();
    if (type !== 'say' && type !== 'embed') {
      return message.reply('El tipo debe ser "say" o "embed".');
    }

    const config = getConfig();
    if (!config[message.guild.id]) config[message.guild.id] = {};
    
    let welcomeMessage = {
      type: type,
      message: args.slice(4).join(' ')
    };

    if (type === 'embed') {
      welcomeMessage.color = args[1];
      welcomeMessage.title = args[2];
      welcomeMessage.showTime = args[3].toLowerCase() === 'true';
    }

    config[message.guild.id].welcomeMessage = welcomeMessage;
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
        .setDescription('Color del embed (solo para tipo embed)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('titulo')
        .setDescription('Título del embed (solo para tipo embed)')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('mostrar_hora')
        .setDescription('Mostrar hora en el footer del embed (solo para tipo embed)')
        .setRequired(false))
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
    const message = interaction.options.getString('mensaje');

    const config = getConfig();
    if (!config[interaction.guild.id]) config[interaction.guild.id] = {};

    let welcomeMessage = {
      type: type,
      message: message
    };

    if (type === 'embed') {
      welcomeMessage.color = color;
      welcomeMessage.title = title;
      welcomeMessage.showTime = showTime;
    }

    config[interaction.guild.id].welcomeMessage = welcomeMessage;
    saveConfig(config);

    interaction.reply('El mensaje de bienvenida ha sido configurado.');
  },
};

