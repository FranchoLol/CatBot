const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'delprefix',
  description: 'Elimina el prefijo personalizado del servidor',
  usage: 'k!delprefix',
  run: async (client, message, args, lang) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply(getResponse(lang, 'noPermission'));
    }

    const dataDir = path.join(__dirname, '..', 'data');
    const prefixesPath = path.join(dataDir, 'prefixes.json');

    if (!fs.existsSync(prefixesPath)) {
      return message.reply(getResponse(lang, 'noPrefixSet'));
    }

    let prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));

    if (!prefixes[message.guild.id]) {
      return message.reply(getResponse(lang, 'noPrefixSet'));
    }

    delete prefixes[message.guild.id];
    fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 2));

    await message.reply(getResponse(lang, 'prefixDeleted', client.config.defaultPrefix));
  },
  data: new SlashCommandBuilder()
    .setName('delprefix')
    .setDescription('Elimina el prefijo personalizado del servidor'),
  async execute(interaction, lang) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: getResponse(lang, 'noPermission'), ephemeral: true });
    }

    const dataDir = path.join(__dirname, '..', 'data');
    const prefixesPath = path.join(dataDir, 'prefixes.json');

    if (!fs.existsSync(prefixesPath)) {
      return interaction.reply({ content: getResponse(lang, 'noPrefixSet'), ephemeral: true });
    }

    let prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));

    if (!prefixes[interaction.guildId]) {
      return interaction.reply({ content: getResponse(lang, 'noPrefixSet'), ephemeral: true });
    }

    delete prefixes[interaction.guildId];
    fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 2));

    await interaction.reply(getResponse(lang, 'prefixDeleted', interaction.client.config.defaultPrefix));
  },
};

function getResponse(lang, key, ...args) {
  const responses = {
    es: {
      noPermission: 'No tienes permiso para eliminar el prefijo del bot.',
      noPrefixSet: 'Este servidor no tiene un prefijo personalizado configurado.',
      prefixDeleted: 'El prefijo personalizado ha sido eliminado. El prefijo por defecto es: %s'
    },
    en: {
      noPermission: 'You don\'t have permission to delete the bot\'s prefix.',
      noPrefixSet: 'This server doesn\'t have a custom prefix set.',
      prefixDeleted: 'The custom prefix has been deleted. The default prefix is: %s'
    },
    pt: {
      noPermission: 'Você não tem permissão para excluir o prefixo do bot.',
      noPrefixSet: 'Este servidor não tem um prefixo personalizado configurado.',
      prefixDeleted: 'O prefixo personalizado foi excluído. O prefixo padrão é: %s'
    }
  };

  let message = responses[lang][key] || responses['en'][key];
  for (let i = 0; i < args.length; i++) {
    message = message.replace('%s', args[i]);
  }
  return message;
}

