const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const welcomeConfigPath = path.join(__dirname, '..', 'data', 'welcome_config.json');
const goodbyeConfigPath = path.join(__dirname, '..', 'data', 'goodbye_config.json');

function getConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

module.exports = {
  name: 'greetingsettings',
  description: 'Muestra la configuración actual de bienvenida y despedida',
  usage: 'c!greetingsettings',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const welcomeConfig = getConfig(welcomeConfigPath);
    const goodbyeConfig = getConfig(goodbyeConfigPath);

    const guildWelcomeConfig = welcomeConfig[message.guild.id] || {};
    const guildGoodbyeConfig = goodbyeConfig[message.guild.id] || {};

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Configuración de Bienvenida y Despedida')
      .addFields(
        { name: 'Canal de Bienvenida', value: guildWelcomeConfig.welcomeChannel ? `<#${guildWelcomeConfig.welcomeChannel}>` : 'No configurado' },
        { name: 'Mensaje de Bienvenida', value: guildWelcomeConfig.welcomeMessage ? `Tipo: ${guildWelcomeConfig.welcomeMessage.type}\nMensaje: ${guildWelcomeConfig.welcomeMessage.message}` : 'No configurado' },
        { name: 'Canal de Despedida', value: guildGoodbyeConfig.goodbyeChannel ? `<#${guildGoodbyeConfig.goodbyeChannel}>` : 'No configurado' },
        { name: 'Mensaje de Despedida', value: guildGoodbyeConfig.goodbyeMessage ? `Tipo: ${guildGoodbyeConfig.goodbyeMessage.type}\nMensaje: ${guildGoodbyeConfig.goodbyeMessage.message}` : 'No configurado' }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('greetingsettings')
    .setDescription('Muestra la configuración actual de bienvenida y despedida'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const welcomeConfig = getConfig(welcomeConfigPath);
    const goodbyeConfig = getConfig(goodbyeConfigPath);

    const guildWelcomeConfig = welcomeConfig[interaction.guild.id] || {};
    const guildGoodbyeConfig = goodbyeConfig[interaction.guild.id] || {};

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Configuración de Bienvenida y Despedida')
      .addFields(
        { name: 'Canal de Bienvenida', value: guildWelcomeConfig.welcomeChannel ? `<#${guildWelcomeConfig.welcomeChannel}>` : 'No configurado' },
        { name: 'Mensaje de Bienvenida', value: guildWelcomeConfig.welcomeMessage ? `Tipo: ${guildWelcomeConfig.welcomeMessage.type}\nMensaje: ${guildWelcomeConfig.welcomeMessage.message}` : 'No configurado' },
        { name: 'Canal de Despedida', value: guildGoodbyeConfig.goodbyeChannel ? `<#${guildGoodbyeConfig.goodbyeChannel}>` : 'No configurado' },
        { name: 'Mensaje de Despedida', value: guildGoodbyeConfig.goodbyeMessage ? `Tipo: ${guildGoodbyeConfig.goodbyeMessage.type}\nMensaje: ${guildGoodbyeConfig.goodbyeMessage.message}` : 'No configurado' }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};

