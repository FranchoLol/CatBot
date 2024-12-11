const { PermissionFlagsBits, ChannelType } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'movechannel',
  description: 'Mueve un canal a una categoría o posición específica',
  usage: 'k!movechannel <canal> [categoría] [posición]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('No tienes permiso para mover canales.');
    }

    if (args.length < 1) {
      return message.reply('Uso correcto: k!movechannel <canal> [categoría] [posición]');
    }

    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find(c => c.name === args[0]);
    if (!channel) {
      return message.reply('No se encontró el canal especificado.');
    }

    let category;
    let position;

    if (args[1]) {
      category = message.guild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && (c.name.toLowerCase() === args[1].toLowerCase() || c.id === args[1])
      );
    }

    if (args[2]) {
      position = parseInt(args[2]);
      if (isNaN(position)) {
        return message.reply('La posición debe ser un número válido.');
      }
    }

    try {
      await channel.edit({
        parent: category ? category.id : null,
        position: position !== undefined ? position : channel.position,
      });
      message.reply(`Canal "${channel.name}" movido exitosamente${category ? ` a la categoría "${category.name}"` : ''}${position !== undefined ? ` y a la posición ${position}` : ''}.`);
    } catch (error) {
      console.error(error);
      message.reply('Hubo un error al mover el canal.');
    }
  },
  data: {
    name: 'movechannel',
    description: 'Mueve un canal a una categoría o posición específica',
    options: [
      {
        name: 'canal',
        type: 7, // CHANNEL type
        description: 'El canal que quieres mover',
        required: true,
      },
      {
        name: 'categoria',
        type: 3, // STRING type
        description: 'El nombre o ID de la categoría a la que mover el canal',
        required: false,
      },
      {
        name: 'posicion',
        type: 4, // INTEGER type
        description: 'La nueva posición del canal',
        required: false,
      },
    ],
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: 'No tienes permiso para mover canales.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('canal');
    const categoryInput = interaction.options.getString('categoria');
    const position = interaction.options.getInteger('posicion');

    let category;
    if (categoryInput) {
      category = interaction.guild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && (c.name.toLowerCase() === categoryInput.toLowerCase() || c.id === categoryInput)
      );
    }

    try {
      await channel.edit({
        parent: category ? category.id : null,
        position: position !== null ? position : channel.position,
      });
      interaction.reply(`Canal "${channel.name}" movido exitosamente${category ? ` a la categoría "${category.name}"` : ''}${position !== null ? ` y a la posición ${position}` : ''}.`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Hubo un error al mover el canal.', ephemeral: true });
    }
  },
};

