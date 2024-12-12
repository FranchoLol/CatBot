const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'emoji',
  description: 'Muestra una lista de todos los emojis del servidor',
  usage: 'c!emoji',
  run: async (client, message, args) => {
    const emojis = message.guild.emojis.cache.filter(emoji => !emoji.animated);
    await sendEmojiList(message, emojis, 'Emojis del servidor');
  },
  data: new SlashCommandBuilder()
    .setName('emoji')
    .setDescription('Muestra una lista de todos los emojis del servidor'),
  async execute(interaction) {
    const emojis = interaction.guild.emojis.cache.filter(emoji => !emoji.animated);
    await sendEmojiList(interaction, emojis, 'Emojis del servidor');
  },
};

async function sendEmojiList(context, emojis, title) {
  const emojiList = emojis.map(emoji => `${emoji} **|** \`<:${emoji.name}:${emoji.id}>\``).join('\n');
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(title);

  if (emojiList.length <= 2048) {
    embed.setDescription(emojiList);
    await context.reply({ embeds: [embed] });
  } else {
    const chunks = emojiList.match(/.{1,2048}/g);
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

