const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { setPremium, isPremium, getPremiumSettings } = require('../utils/premiumUtils');

module.exports = {
  name: 'premium',
  description: 'Gestiona la versión premium del bot',
  usage: 'c!premium [activate/deactivate] [virtualName] [virtualAvatarURL]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const subcommand = args[0]?.toLowerCase();
    const virtualName = args[1] || 'CatGold 🐈';
    const virtualAvatar = args[2] || 'https://example.com/catgold.png';

    if (!subcommand || (subcommand !== 'activate' && subcommand !== 'deactivate')) {
      return message.reply('Uso correcto: c!premium [activate/deactivate] [virtualName] [virtualAvatarURL]');
    }

    const guildId = message.guild.id;
    const currentStatus = await isPremium(guildId);

    if (subcommand === 'activate') {
      if (currentStatus) {
        return message.reply('Este servidor ya tiene la versión premium activada.');
      }
      await setPremium(guildId, true, virtualName, virtualAvatar);
      return message.reply(`¡Versión premium activada! El bot aparecerá como "${virtualName}" en este servidor.`);
    } else {
      if (!currentStatus) {
        return message.reply('Este servidor no tiene la versión premium activada.');
      }
      await setPremium(guildId, false);
      return message.reply('Versión premium desactivada. El bot volverá a su apariencia normal en este servidor.');
    }
  },
  data: new SlashCommandBuilder()
    .setName('premium')
    .setDescription('Gestiona la versión premium del bot')
    .addSubcommand(subcommand =>
      subcommand
        .setName('activate')
        .setDescription('Activa la versión premium del bot')
        .addStringOption(option =>
          option.setName('virtualname')
            .setDescription('Nombre virtual para el bot en este servidor')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('virtualavatar')
            .setDescription('URL del avatar virtual para el bot en este servidor')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('deactivate')
        .setDescription('Desactiva la versión premium del bot')),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const currentStatus = await isPremium(guildId);

    if (subcommand === 'activate') {
      if (currentStatus) {
        return interaction.reply('Este servidor ya tiene la versión premium activada.');
      }
      const virtualName = interaction.options.getString('virtualname') || 'CatGold 🐈';
      const virtualAvatar = interaction.options.getString('virtualavatar') || 'https://example.com/catgold.png';
      await setPremium(guildId, true, virtualName, virtualAvatar);
      return interaction.reply(`¡Versión premium activada! El bot aparecerá como "${virtualName}" en este servidor.`);
    } else {
      if (!currentStatus) {
        return interaction.reply('Este servidor no tiene la versión premium activada.');
      }
      await setPremium(guildId, false);
      return interaction.reply('Versión premium desactivada. El bot volverá a su apariencia normal en este servidor.');
    }
  },
};

