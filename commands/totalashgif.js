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
  const embeds = [];
  client.guilds.cache.forEach(guild => {
    const guildGifs = guild.emojis.cache.filter(emoji => emoji.animated);
    if (guildGifs.size > 0) {
      const gifList = guildGifs.map(gif => `${gif}`).join(' ');
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Gif - ${guild.name}`)
        .setDescription(gifList);
      embeds.push(embed);
    }
  });

  if (embeds.length === 0) {
    return context.reply('No se encontraron GIFs en ningún servidor.');
  }

  for (let i = 0; i < embeds.length; i++) {
    if (i === 0) {
      await context.reply({ embeds: [embeds[i]] });
    } else {
      await context.channel.send({ embeds: [embeds[i]] });
    }
  }
}

