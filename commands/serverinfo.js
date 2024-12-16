const { EmbedBuilder, ChannelType } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const moment = require('moment');

const MAX_EMBED_FIELDS = 25;

module.exports = {
  name: 'serverinfo',
  description: 'Muestra información detallada sobre el servidor',
  usage: 'k!serverinfo',
  run: async (client, message) => {
    const guild = message.guild;
    await guild.members.fetch();
    const owner = await guild.fetchOwner();
    const createdAt = moment(guild.createdAt).format('DD/MM/YYYY HH:mm:ss');
    const createdAgo = moment(guild.createdAt).fromNow();
    
    const verificationLevels = {
      0: 'Ninguno',
      1: 'Bajo',
      2: 'Medio',
      3: 'Alto',
      4: 'Máximo'
    };

    const preferredLocale = guild.preferredLocale || 'Desconocido';

    const botJoinedAt = moment(guild.members.cache.get(client.user.id).joinedAt).format('DD/MM/YYYY HH:mm:ss');
    const botJoinedAgo = moment(guild.members.cache.get(client.user.id).joinedAt).fromNow();

    const customEmojis = guild.emojis.cache.size;
    const staticEmojis = guild.emojis.cache.filter(emoji => !emoji.animated).size;
    const animatedEmojis = guild.emojis.cache.filter(emoji => emoji.animated).size;

    const emojis = guild.emojis.cache.map(emoji => emoji.toString()).slice(0, 20).join(' ') || 'No hay emojis personalizados.';
    
    const gifEmojis = guild.emojis.cache.filter(emoji => emoji.animated).map(emoji => emoji.toString()).slice(0, 20).join(' ') || 'No hay GIFs personalizados.';

    const onlineMembers = guild.members.cache.filter(member => member.presence?.status !== 'offline' && (member.presence?.status === 'online' || member.presence?.status === 'dnd')).size;
    const activeCommunity = onlineMembers >= 5 ? '¡Comunidad activa!' : 'Comunidad poco activa';

    const description = guild.description || 'No hay descripción disponible.';

    const isCommunity = guild.features.includes('COMMUNITY') ? '¡Este servidor está habilitado como una comunidad!' : 'Este servidor no está habilitado como comunidad.';

    const forumChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildForum).size;
    const announcementChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildAnnouncement).size;
    const stageChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildStageVoice).size;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Información del Servidor: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .setTimestamp();

    const fields = [
      { name: 'ID', value: guild.id, inline: true },
      { name: 'Dueño', value: `<@${owner.id}> (${owner.user.tag} - id: ${owner.id})`, inline: true },
      { name: 'Región', value: guild.preferredLocale, inline: true },
      { name: 'Creado el', value: `${createdAt}\n(${createdAgo})`, inline: false },
      { name: 'Fecha de unión del Bot', value: `${botJoinedAt}\n(${botJoinedAgo})`, inline: false },
      { name: 'Miembros', value: guild.memberCount.toString(), inline: true },
      { name: 'Humanos', value: guild.members.cache.filter(member => !member.user.bot).size.toString(), inline: true },
      { name: 'Bots', value: guild.members.cache.filter(member => member.user.bot).size.toString(), inline: true },
      { name: 'Canales de Texto', value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size.toString(), inline: true },
      { name: 'Canales de Voz', value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size.toString(), inline: true },
      { name: 'Categorías', value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size.toString(), inline: true },
      { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
      { name: 'Emojis/GIFs', value: `${staticEmojis}/${animatedEmojis} (${customEmojis})`, inline: true },
      { name: 'Impulsos', value: guild.premiumSubscriptionCount?.toString() || '0', inline: true },
      { name: 'Nivel de Impulso', value: guild.premiumTier?.toString() || 'Sin nivel', inline: true },
      { name: 'Nivel de Verificación', value: verificationLevels[guild.verificationLevel], inline: true },
      { name: 'Requiere 2FA', value: guild.mfaLevel ? 'Sí' : 'No', inline: true },
      { name: 'Idioma', value: preferredLocale, inline: true },
      { name: 'Descripción', value: description, inline: false },
      { name: 'Actividad de la Comunidad', value: activeCommunity, inline: false },
      { name: 'Estado de Comunidad', value: isCommunity, inline: false },
      { name: 'Canales de Foro', value: forumChannels.toString(), inline: true },
      { name: 'Canales de Anuncios', value: announcementChannels.toString(), inline: true },
      { name: 'Canales de Escenario', value: stageChannels.toString(), inline: true },
      { name: 'Emojis:', value: emojis, inline: false },
    ];

    // Add fields to embed, ensuring we don't exceed the maximum
    embed.addFields(fields.slice(0, MAX_EMBED_FIELDS));

    // If we have more fields than the maximum, add a note
    if (fields.length > MAX_EMBED_FIELDS) {
      embed.setFooter({ text: `Nota: Algunos campos no se muestran debido a limitaciones de Discord. Total de campos: ${fields.length}` });
    }

    await message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Muestra información detallada sobre el servidor'),
  async execute(interaction) {
    const guild = interaction.guild;
    await guild.members.fetch();
    const owner = await guild.fetchOwner();
    const createdAt = moment(guild.createdAt).format('DD/MM/YYYY HH:mm:ss');
    const createdAgo = moment(guild.createdAt).fromNow();
    
    const verificationLevels = {
      0: 'Ninguno',
      1: 'Bajo',
      2: 'Medio',
      3: 'Alto',
      4: 'Máximo'
    };

    const preferredLocale = guild.preferredLocale || 'Desconocido';

    const botJoinedAt = moment(guild.members.cache.get(interaction.client.user.id).joinedAt).format('DD/MM/YYYY HH:mm:ss');
    const botJoinedAgo = moment(guild.members.cache.get(interaction.client.user.id).joinedAt).fromNow();

    const customEmojis = guild.emojis.cache.size;
    const staticEmojis = guild.emojis.cache.filter(emoji => !emoji.animated).size;
    const animatedEmojis = guild.emojis.cache.filter(emoji => emoji.animated).size;

    const emojis = guild.emojis.cache.map(emoji => emoji.toString()).slice(0, 20).join(' ') || 'No hay emojis personalizados.';
    
    const gifEmojis = guild.emojis.cache.filter(emoji => emoji.animated).map(emoji => emoji.toString()).slice(0, 20).join(' ') || 'No hay GIFs personalizados.';

    const onlineMembers = guild.members.cache.filter(member => member.presence?.status !== 'offline' && (member.presence?.status === 'online' || member.presence?.status === 'dnd')).size;
    const activeCommunity = onlineMembers >= 5 ? '¡Comunidad activa!' : 'Comunidad poco activa';

    const description = guild.description || 'No hay descripción disponible.';

    const isCommunity = guild.features.includes('COMMUNITY') ? '¡Este servidor está habilitado como una comunidad!' : 'Este servidor no está habilitado como comunidad.';

    const forumChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildForum).size;
    const announcementChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildAnnouncement).size;
    const stageChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildStageVoice).size;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Información del Servidor: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .setTimestamp();

    const fields = [
      { name: 'ID', value: guild.id, inline: true },
      { name: 'Dueño', value: `<@${owner.id}> (${owner.user.tag} - id: ${owner.id})`, inline: true },
      { name: 'Región', value: guild.preferredLocale, inline: true },
      { name: 'Creado el', value: `${createdAt}\n(${createdAgo})`, inline: false },
      { name: 'Fecha de unión del Bot', value: `${botJoinedAt}\n(${botJoinedAgo})`, inline: false },
      { name: 'Miembros', value: guild.memberCount.toString(), inline: true },
      { name: 'Humanos', value: guild.members.cache.filter(member => !member.user.bot).size.toString(), inline: true },
      { name: 'Bots', value: guild.members.cache.filter(member => member.user.bot).size.toString(), inline: true },
      { name: 'Canales de Texto', value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size.toString(), inline: true },
      { name: 'Canales de Voz', value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size.toString(), inline: true },
      { name: 'Categorías', value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size.toString(), inline: true },
      { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
      { name: 'Emojis/GIFs', value: `${staticEmojis}/${animatedEmojis} (${customEmojis})`, inline: true },
      { name: 'Impulsos', value: guild.premiumSubscriptionCount?.toString() || '0', inline: true },
      { name: 'Nivel de Impulso', value: guild.premiumTier?.toString() || 'Sin nivel', inline: true },
      { name: 'Nivel de Verificación', value: verificationLevels[guild.verificationLevel], inline: true },
      { name: 'Requiere 2FA', value: guild.mfaLevel ? 'Sí' : 'No', inline: true },
      { name: 'Idioma', value: preferredLocale, inline: true },
      { name: 'Descripción', value: description, inline: false },
      { name: 'Actividad de la Comunidad', value: activeCommunity, inline: false },
      { name: 'Estado de Comunidad', value: isCommunity, inline: false },
      { name: 'Canales de Foro', value: forumChannels.toString(), inline: true },
      { name: 'Canales de Anuncios', value: announcementChannels.toString(), inline: true },
      { name: 'Canales de Escenario', value: stageChannels.toString(), inline: true },
      { name: 'Emojis:', value: emojis, inline: false },
    ];

    // Add fields to embed, ensuring we don't exceed the maximum
    embed.addFields(fields.slice(0, MAX_EMBED_FIELDS));

    // If we have more fields than the maximum, add a note
    if (fields.length > MAX_EMBED_FIELDS) {
      embed.setFooter({ text: `Nota: Algunos campos no se muestran debido a limitaciones de Discord. Total de campos: ${fields.length}` });
    }

    await interaction.reply({ embeds: [embed] });
  },
};

