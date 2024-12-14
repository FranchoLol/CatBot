const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'gif',
  description: 'Muestra una lista de todos los GIFs del servidor',
  usage: 'c!gif',
  run: async (client, message, args) => {
    const gifs = message.guild.emojis.cache.filter(emoji => emoji.animated);
    await sendGifList(message, gifs, 'GIFs del servidor');
  },
  data: new SlashCommandBuilder()
    .setName('gif')
    .setDescription('Muestra una lista de todos los GIFs del servidor'),
  async execute(interaction) {
    const gifs = interaction.guild.emojis.cache.filter(emoji => emoji.animated);
    await sendGifList(interaction, gifs, 'GIFs del servidor');
  },
};

async function sendGifList(context, gifs, title) {
  const gifList = gifs.map(gif => `${gif} **|** \`<a:${gif.name}:${gif.id}>\``).join('\n');
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(title);

  if (gifList.length <= 2048) {
    embed.setDescription(gifList);
    await context.reply({ embeds: [embed] });
  } else {
    const chunks = gifList.match(/.{1,2048}/g);
    for (let i = 0; i < chunks.length; i++) {
      if (i === 0) {
        embed.setDescription(chunks[i]);
        await context.reply({ embeds: [embed] });
      } else {
        const newEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setDescription(chunks[i]);
        await context.followUp({ embeds: [newEmbed] });
      }
    }
  }
}

