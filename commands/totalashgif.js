const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'totalashgif',
  description: 'Muestra una lista de todos los GIFs en todos los servidores (solo para el propietario del bot)',
  usage: 'c!totalashgif',
  run: async (client, message, args) => {
    if (message.author.id !== '561667004755345447') {
      return message.reply('Este comando no existe.');
    }
    await sendTotalGifList(client, message);
  },
  data: new SlashCommandBuilder()
    .setName('totalashgif')
    .setDescription('Muestra una lista de todos los GIFs en todos los servidores (solo para el propietario del bot)'),
  async execute(interaction) {
    if (interaction.user.id !== '561667004755345447') {
      return interaction.reply({ content: 'Este comando no existe.', ephemeral: true });
    }
    await sendTotalGifList(interaction.client, interaction);
  },
};

async function sendTotalGifList(client, context) {
  const allGifs = [];
  client.guilds.cache.forEach(guild => {
    const guildGifs = guild.emojis.cache.filter(emoji => emoji.animated);
    if (guildGifs.size > 0) {
      allGifs.push(`**${guild.name}**`);
      guildGifs.forEach(gif => {
        allGifs.push(`${gif} **|** \`<a:${gif.name}:${gif.id}>\``);
      });
      allGifs.push(''); // Add an empty line between servers
    }
  });

  const gifList = allGifs.join('\n');
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Todos los GIFs en todos los servidores');

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

