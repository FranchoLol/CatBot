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
  const embeds = [];
  client.guilds.cache.forEach(guild => {
    const guildEmojis = guild.emojis.cache.filter(emoji => !emoji.animated);
    if (guildEmojis.size > 0) {
      const emojiList = guildEmojis.map(emoji => `${emoji} **|** \`<:${emoji.name}:${emoji.id}>\``).join('\n');
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Emojis - ${guild.name}`)
        .setDescription(emojiList);
      embeds.push(embed);
    }
  });

  if (embeds.length === 0) {
    return context.reply('No se encontraron emojis en ningún servidor.');
  }

  for (let i = 0; i < embeds.length; i++) {
    if (i === 0) {
      await context.reply({ embeds: [embeds[i]] });
    } else {
      await context.channel.send({ embeds: [embeds[i]] });
    }
  }
}

