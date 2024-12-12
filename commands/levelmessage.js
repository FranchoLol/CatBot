const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { getLevelMessageConfig, setLevelMessageConfig } = require('../utils/experienceUtils');

module.exports = {
  name: 'levelmessage',
  aliases: ['levelmsg'],
  description: 'Configura el mensaje para los anuncios de subida de nivel',
  usage: 'k!levelmessage <enabled/disabled> [color] [id] [showDateTime]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    if (args.length < 1) {
      return message.reply('Por favor, especifica si quieres habilitar o deshabilitar el mensaje personalizado (enabled/disabled).');
    }

    const enabled = args[0].toLowerCase() === 'enabled';
    const color = args[1] || client.config.defaultColor;
    const id = args[2] || '';
    const showDateTime = args[3] ? args[3].toLowerCase() === 'true' : false;

    const config = {
      enabled,
      color,
      id,
      showDateTime,
    };

    setLevelMessageConfig(message.guild.id, config);

    message.reply(`Mensaje de nivel ${enabled ? 'habilitado' : 'deshabilitado'}. Color: ${color}, ID: ${id || 'ninguno'}, Mostrar fecha/hora: ${showDateTime}.`);
  },
  data: new SlashCommandBuilder()
    .setName('levelmessage')
    .setDescription('Configura el mensaje para los anuncios de subida de nivel')
    .addStringOption(option =>
      option.setName('estado')
        .setDescription('Habilitar o deshabilitar el mensaje personalizado')
        .setRequired(true)
        .addChoices(
          { name: 'Habilitado', value: 'enabled' },
          { name: 'Deshabilitado', value: 'disabled' }
        ))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('El color del mensaje (formato: red, #f00, o #ff0000)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('id')
        .setDescription('ID del emoji o GIF para el título')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('showdatetime')
        .setDescription('Mostrar fecha y hora en el pie de página')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const enabled = interaction.options.getString('estado') === 'enabled';
    const color = interaction.options.getString('color') || interaction.client.config.defaultColor;
    const id = interaction.options.getString('id') || '';
    const showDateTime = interaction.options.getBoolean('showdatetime') || false;

    const config = {
      enabled,
      color,
      id,
      showDateTime,
    };

    setLevelMessageConfig(interaction.guild.id, config);

    interaction.reply(`Mensaje de nivel ${enabled ? 'habilitado' : 'deshabilitado'}. Color: ${color}, ID: ${id || 'ninguno'}, Mostrar fecha/hora: ${showDateTime}.`);
  },
};
