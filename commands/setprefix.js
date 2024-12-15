const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'setprefix',
  description: 'Cambia el prefijo del bot para este servidor',
  usage: 'k!setprefix <nuevo_prefijo>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para cambiar el prefijo del bot.');
    }

    if (!args[0]) {
      return message.reply('Por favor, proporciona un nuevo prefijo.');
    }

    const newPrefix = args[0];
    const dataDir = path.join(__dirname, '..', 'data');
    const prefixesPath = path.join(dataDir, 'prefixes.json');

    // Crear el directorio data si no existe
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Crear el archivo prefixes.json si no existe
    if (!fs.existsSync(prefixesPath)) {
      fs.writeFileSync(prefixesPath, '{}', 'utf8');
    }

    let prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
    prefixes[message.guild.id] = newPrefix;
    fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 2));

    await message.reply(`El prefijo del bot para este servidor ha sido cambiado a: ${newPrefix}`);
  },
  data: {
    name: 'setprefix',
    description: 'Cambia el prefijo del bot para este servidor',
    options: [
      {
        name: 'prefijo',
        type: 3, // STRING type
        description: 'El nuevo prefijo para el bot',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para cambiar el prefijo del bot.', ephemeral: true });
    }

    const newPrefix = interaction.options.getString('prefijo');
    const dataDir = path.join(__dirname, '..', 'data');
    const prefixesPath = path.join(dataDir, 'prefixes.json');

    // Crear el directorio data si no existe
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Crear el archivo prefixes.json si no existe
    if (!fs.existsSync(prefixesPath)) {
      fs.writeFileSync(prefixesPath, '{}', 'utf8');
    }

    let prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
    prefixes[interaction.guild.id] = newPrefix;
    fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 2));

    await interaction.reply(`El prefijo del bot para este servidor ha sido cambiado a: ${newPrefix}`);
  },
};

