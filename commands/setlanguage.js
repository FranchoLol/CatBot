const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

const languages = {
  'es': 'Español',
  'en': 'English',
  'pt': 'Português'
};

module.exports = {
  name: 'setlanguage',
  description: 'Cambia el idioma del bot para este servidor',
  usage: 'k!setlanguage <es|en|pt>',
  run: async (client, message, args, currentLanguage) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      const responses = {
        'es': 'No tienes permiso para cambiar el idioma del bot.',
        'en': 'You don\'t have permission to change the bot\'s language.',
        'pt': 'Você não tem permissão para alterar o idioma do bot.'
      };
      return message.reply(responses[currentLanguage]);
    }

    if (!args[0] || !languages[args[0]]) {
      const responses = {
        'es': `Por favor, proporciona un idioma válido: ${Object.keys(languages).join(', ')}`,
        'en': `Please provide a valid language: ${Object.keys(languages).join(', ')}`,
        'pt': `Por favor, forneça um idioma válido: ${Object.keys(languages).join(', ')}`
      };
      return message.reply(responses[currentLanguage]);
    }

    const newLanguage = args[0];
    const dataDir = path.join(__dirname, '..', 'data');
    const languagesPath = path.join(dataDir, 'languages.json');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(languagesPath)) {
      fs.writeFileSync(languagesPath, '{}', 'utf8');
    }

    let languagesData = JSON.parse(fs.readFileSync(languagesPath, 'utf8'));
    languagesData[message.guild.id] = newLanguage;
    fs.writeFileSync(languagesPath, JSON.stringify(languagesData, null, 2));

    const responses = {
      'es': `El idioma del bot para este servidor ha sido cambiado a: ${languages[newLanguage]}`,
      'en': `The bot's language for this server has been changed to: ${languages[newLanguage]}`,
      'pt': `O idioma do bot para este servidor foi alterado para: ${languages[newLanguage]}`
    };
    await message.reply(responses[newLanguage]);
  },
  data: new SlashCommandBuilder()
    .setName('setlanguage')
    .setDescription('Cambia el idioma del bot para este servidor')
    .addStringOption(option =>
      option.setName('idioma')
        .setDescription('El nuevo idioma para el bot')
        .setRequired(true)
        .addChoices(
          { name: 'Español', value: 'es' },
          { name: 'English', value: 'en' },
          { name: 'Português', value: 'pt' }
        )),
  async execute(interaction, currentLanguage) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      const responses = {
        'es': 'No tienes permiso para cambiar el idioma del bot.',
        'en': 'You don\'t have permission to change the bot\'s language.',
        'pt': 'Você não tem permissão para alterar o idioma do bot.'
      };
      return interaction.reply({ content: responses[currentLanguage], ephemeral: true });
    }

    const newLanguage = interaction.options.getString('idioma');
    const dataDir = path.join(__dirname, '..', 'data');
    const languagesPath = path.join(dataDir, 'languages.json');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(languagesPath)) {
      fs.writeFileSync(languagesPath, '{}', 'utf8');
    }

    let languagesData = JSON.parse(fs.readFileSync(languagesPath, 'utf8'));
    languagesData[interaction.guildId] = newLanguage;
    fs.writeFileSync(languagesPath, JSON.stringify(languagesData, null, 2));

    const responses = {
      'es': `El idioma del bot para este servidor ha sido cambiado a: ${languages[newLanguage]}`,
      'en': `The bot's language for this server has been changed to: ${languages[newLanguage]}`,
      'pt': `O idioma do bot para este servidor foi alterado para: ${languages[newLanguage]}`
    };
    await interaction.reply(responses[newLanguage]);
  },
};

