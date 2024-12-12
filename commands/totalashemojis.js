const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'totalashemojis',
  description: 'Muestra una lista de todos los emojis en todos los servidores (solo para el propietario del bot)',
  usage: 'c!totalashemojis',
  run: async (client, message, args) => {
    if (message.author.id !== '561667004755345447') {
      return message.reply('Este comando no existe.');
    }
    await sendTotalEmojiList(client, message);
  },
  data: new SlashCommandBuilder()
    .setName('totalashemojis')
    .setDescription('Muestra una lista de todos los emojis en todos los servidores (solo para el propietario del bot)'),
  async execute(interaction) {
    if (interaction.user.id !== '561667004755345447') {
      return interaction.reply({ content: 'Este comando no existe.', ephemeral: true });
    }
    await sendTotalEmojiList(interaction.client, interaction);
  },
};

async function sendTotalEmojiList(client, context) {
  const allEmojis = [];
  client.guilds.cache.forEach(guild => {
    const guildEmojis = guild.emojis.cache.filter(emoji => !emoji.animated);
    if (guildEmojis.size > 0) {
      allEmojis.push(`**${guild.name}**`);
      guildEmojis.forEach(emoji => {
        allEmojis.push(`${emoji} **|** \`<:${emoji.name}:${emoji.id}>\``);
      });
      allEmojis.push(''); // Add an empty line between servers
    }
  });

  const emojiList = allEmojis.join('\n');
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Todos los emojis en todos los servidores');

  if (emojiList.length <= 2048) {
    embed.setDescription(emojiList);
    await context.reply({ embeds: [embed] });
  } else {
    const chunks = emojiList.match(/.{1,2048}/g);
    for (let i = 0; i < chunks.length; i++) {
      const newEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setDescription(chunks[i]);
      if (i === 0) {
        await context.reply({ embeds: [newEmbed] });
      } else {
        await context.channel.send({ embeds: [newEmbed] });
      }
    }
  }
}

