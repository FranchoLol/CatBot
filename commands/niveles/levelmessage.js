const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { setLevelChannelConfig, getLevelChannelConfig } = require('../../utils/experienceUtils');

module.exports = {
  name: 'levelmessage',
  description: 'Configura el mensaje para los anuncios de subida de nivel',
  usage: 'c!levelmessage [say/embed] [color] [fecha y hora] [texto]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    if (args.length < 4) {
      return message.reply('Uso correcto: c!levelmessage [say/embed] [color] [true/false] [texto]');
    }

    const [type, color, showDateTime, ...textParts] = args;
    let text = textParts.join(' ');

    if (type !== 'say' && type !== 'embed') {
      return message.reply('El tipo debe ser "say" o "embed".');
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return message.reply('El color debe ser un código hexadecimal válido (por ejemplo, #FF0000).');
    }

    if (showDateTime !== 'true' && showDateTime !== 'false') {
      return message.reply('La opción de fecha y hora debe ser "true" o "false".');
    }

    // Procesar GIFs en el texto
    text = text.replace(/\[gif:([^\]]+)\]/g, (match, id) => {
      return `[gif:${id}]`;
    });

    const config = getLevelChannelConfig(message.guild.id);
    config.message = {
      type,
      color,
      showDateTime: showDateTime === 'true',
      text
    };

    setLevelChannelConfig(message.guild.id, config.channelId, config.message);

    message.reply('Mensaje de nivel configurado correctamente. Puedes usar [gif:ID] para incluir GIFs en el mensaje.');
  },
  data: new SlashCommandBuilder()
    .setName('levelmessage')
    .setDescription('Configura el mensaje para los anuncios de subida de nivel')
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
        .setDescription('Color del mensaje (código hexadecimal)')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('fecha_hora')
        .setDescription('Mostrar fecha y hora')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('texto')
        .setDescription('Texto del mensaje')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const type = interaction.options.getString('tipo');
    const color = interaction.options.getString('color');
    const showDateTime = interaction.options.getBoolean('fecha_hora');
    let text = interaction.options.getString('texto');

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return interaction.reply({ content: 'El color debe ser un código hexadecimal válido (por ejemplo, #FF0000).', ephemeral: true });
    }

    // Procesar GIFs en el texto
    text = text.replace(/\[gif:([^\]]+)\]/g, (match, id) => {
      return `[gif:${id}]`;
    });

    const config = getLevelChannelConfig(interaction.guild.id);
    config.message = {
      type,
      color,
      showDateTime,
      text
    };

    setLevelChannelConfig(interaction.guild.id, config.channelId, config.message);

    interaction.reply('Mensaje de nivel configurado correctamente. Puedes usar [gif:ID] para incluir GIFs en el mensaje.');
  },
};

