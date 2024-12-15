const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

const activeGiveaways = new Map();

module.exports = {
  name: 'giveaway',
  description: 'Crea un sorteo',
  usage: 'c!giveaway <duración> <ganadores> <premio>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para crear sorteos.');
    }

    if (args.length < 3) {
      return message.reply('Uso correcto: c!giveaway <duración> <ganadores> <premio>');
    }

    const duration = parseDuration(args[0]);
    if (!duration) {
      return message.reply('Duración inválida. Usa formato como 1d, 5h, 30m, 20s o combinados como 1d12h.');
    }

    const winners = parseInt(args[1]);
    if (isNaN(winners) || winners < 1) {
      return message.reply('El número de ganadores debe ser un número válido mayor que 0.');
    }

    const prize = args.slice(2).join(' ');
    const endTime = Date.now() + duration;

    const embed = createGiveawayEmbed(prize, endTime, winners, message.author);
    const giveawayMessage = await message.channel.send({ embeds: [embed] });
    await giveawayMessage.react('🎉');

    activeGiveaways.set(giveawayMessage.id, {
      endTime,
      winners,
      prize,
      hostId: message.author.id,
      channelId: message.channel.id,
    });

    message.delete().catch(console.error);

    setTimeout(() => endGiveaway(client, giveawayMessage.id), duration);
  },
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Crea un sorteo')
    .addStringOption(option =>
      option.setName('duracion')
        .setDescription('Duración del sorteo (ej: 1d, 5h, 30m, 20s)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('ganadores')
        .setDescription('Número de ganadores')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('premio')
        .setDescription('Premio del sorteo')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('Canal para el sorteo (opcional)')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para crear sorteos.', ephemeral: true });
    }

    const duration = parseDuration(interaction.options.getString('duracion'));
    if (!duration) {
      return interaction.reply({ content: 'Duración inválida. Usa formato como 1d, 5h, 30m, 20s o combinados como 1d12h.', ephemeral: true });
    }

    const winners = interaction.options.getInteger('ganadores');
    if (winners < 1) {
      return interaction.reply({ content: 'El número de ganadores debe ser mayor que 0.', ephemeral: true });
    }

    const prize = interaction.options.getString('premio');
    const channel = interaction.options.getChannel('canal') || interaction.channel;
    const endTime = Date.now() + duration;

    const embed = createGiveawayEmbed(prize, endTime, winners, interaction.user);
    const giveawayMessage = await channel.send({ embeds: [embed] });
    await giveawayMessage.react('🎉');

    activeGiveaways.set(giveawayMessage.id, {
      endTime,
      winners,
      prize,
      hostId: interaction.user.id,
      channelId: channel.id,
    });

    interaction.reply({ content: `Sorteo creado en ${channel}!`, ephemeral: true });

    setTimeout(() => endGiveaway(interaction.client, giveawayMessage.id), duration);
  },
};

function parseDuration(durationString) {
  const regex = /(\d+)([dhms])/g;
  let duration = 0;
  let match;

  while ((match = regex.exec(durationString)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
      case 'd': duration += value * 24 * 60 * 60 * 1000; break;
      case 'h': duration += value * 60 * 60 * 1000; break;
      case 'm': duration += value * 60 * 1000; break;
      case 's': duration += value * 1000; break;
    }
  }

  return duration > 0 ? duration : null;
}

function createGiveawayEmbed(prize, endTime, winners, host) {
  return new EmbedBuilder()
    .setTitle('🎉 Sorteo')
    .setDescription(processDescription(prize))
    .addFields(
      { name: 'Termina en', value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true },
      { name: 'Ganadores', value: winners.toString(), inline: true },
      { name: 'Creado por', value: `<@${host.id}>`, inline: true }
    )
    .setColor('#FF1493')
    .setFooter({ text: 'Reacciona con 🎉 para participar!' });
}

function processDescription(description) {
  return description.replace(/\[gif:(\d+)\]/g, (match, id) => `<a:giveaway_gif:${id}>`);
}

async function endGiveaway(client, messageId) {
  const giveaway = activeGiveaways.get(messageId);
  if (!giveaway) return;

  const channel = await client.channels.fetch(giveaway.channelId);
  const message = await channel.messages.fetch(messageId);
  const reaction = message.reactions.cache.get('🎉');

  const users = await reaction.users.fetch();
  const validParticipants = users.filter(user => !user.bot);

  let winners = [];
  if (validParticipants.size > 0) {
    winners = validParticipants.random(Math.min(giveaway.winners, validParticipants.size));
  }

  const winnerAnnouncement = winners.length > 0
    ? `Felicidades ${winners.map(w => `<@${w.id}>`).join(', ')}! Has ganado **${giveaway.prize}**!`
    : 'No hubo participantes válidos para este sorteo.';

  const endEmbed = new EmbedBuilder()
    .setTitle('🎉 Sorteo Finalizado')
    .setDescription(processDescription(giveaway.prize))
    .addFields(
      { name: 'Ganadores', value: winnerAnnouncement },
      { name: 'Creado por', value: `<@${giveaway.hostId}>` }
    )
    .setColor('#FF1493')
    .setTimestamp();

  await message.edit({ embeds: [endEmbed] });
  channel.send(winnerAnnouncement);

  activeGiveaways.delete(messageId);
}

