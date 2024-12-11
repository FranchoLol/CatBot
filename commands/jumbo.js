const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'jumbo',
  description: 'Muestra una versión ampliada de un emoji o GIF',
  usage: 'k!jumbo <emoji o GIF>',
  run: async (client, message, args) => {
    if (!args[0]) {
      return message.reply('Por favor, proporciona un emoji o GIF para ampliar.');
    }

    const input = args[0];
    let emojiUrl;
    let isAnimated = false;

    if (input.startsWith('<') && input.endsWith('>')) {
      const match = input.match(/<(a?):(\w+):(\d+)>/);
      if (match) {
        isAnimated = match[1] === 'a';
        const emojiId = match[3];
        emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}?v=1&size=4096`;
      }
    } else if (input.match(/\d+/)) {
      // Asumimos que es un ID de emoji personalizado
      const emojiId = input.match(/\d+/)[0];
      // Intentamos primero como GIF, si falla, lo trataremos como PNG
      emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.gif?v=1&size=4096`;
      isAnimated = true;
    } else {
      // Emoji Unicode
      const codePoints = [...input].map(char => char.codePointAt(0).toString(16)).join('-');
      emojiUrl = `https://twemoji.maxcdn.com/v/latest/svg/${codePoints}.svg`;
    }

    if (!emojiUrl) {
      return message.reply('No se pudo encontrar un emoji o GIF válido.');
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Emoji o GIF Ampliado')
      .setImage(emojiUrl)
      .setTimestamp();

    try {
      await message.reply({ embeds: [embed] });
    } catch (error) {
      // Si falla y estábamos intentando un GIF, probamos con PNG
      if (isAnimated && input.match(/\d+/)) {
        const emojiId = input.match(/\d+/)[0];
        emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.png?v=1&size=4096`;
        embed.setImage(emojiUrl);
        await message.reply({ embeds: [embed] });
      } else {
        await message.reply('Hubo un error al mostrar el emoji o GIF.');
      }
    }
  },
  data: {
    name: 'jumbo',
    description: 'Muestra una versión ampliada de un emoji o GIF',
    options: [
      {
        name: 'emoji',
        type: 3, // STRING type
        description: 'El emoji o GIF que quieres ampliar',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const input = interaction.options.getString('emoji');

    let emojiUrl;
    let isAnimated = false;

    if (input.startsWith('<') && input.endsWith('>')) {
      const match = input.match(/<(a?):(\w+):(\d+)>/);
      if (match) {
        isAnimated = match[1] === 'a';
        const emojiId = match[3];
        emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}?v=1&size=4096`;
      }
    } else if (input.match(/\d+/)) {
      // Asumimos que es un ID de emoji personalizado
      const emojiId = input.match(/\d+/)[0];
      // Intentamos primero como GIF, si falla, lo trataremos como PNG
      emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.gif?v=1&size=4096`;
      isAnimated = true;
    } else {
      // Emoji Unicode
      const codePoints = [...input].map(char => char.codePointAt(0).toString(16)).join('-');
      emojiUrl = `https://twemoji.maxcdn.com/v/latest/svg/${codePoints}.svg`;
    }

    if (!emojiUrl) {
      return interaction.reply('No se pudo encontrar un emoji o GIF válido.');
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Emoji o GIF Ampliado')
      .setImage(emojiUrl)
      .setTimestamp();

    try {
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      // Si falla y estábamos intentando un GIF, probamos con PNG
      if (isAnimated && input.match(/\d+/)) {
        const emojiId = input.match(/\d+/)[0];
        emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.png?v=1&size=4096`;
        embed.setImage(emojiUrl);
        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply('Hubo un error al mostrar el emoji o GIF.');
      }
    }
  },
};

