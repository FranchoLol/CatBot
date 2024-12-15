const { EmbedBuilder, ChannelType } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
  name: 'serverinfo',
  description: 'Muestra información detallada sobre el servidor',
  usage: 'k!serverinfo',
  run: async (client, message) => {
    const guild = message.guild;
    await guild.members.fetch(); // Asegurarse de cargar todos los miembros
    const owner = await guild.fetchOwner();
    const createdAt = moment(guild.createdAt).format('DD/MM/YYYY HH:mm:ss');
    const createdAgo = moment(guild.createdAt).fromNow();
    
    // Verificación de niveles
    const verificationLevels = {
      0: 'Ninguno',
      1: 'Bajo',
      2: 'Medio',
      3: 'Alto',
      4: 'Máximo'
    };

    // Información sobre la región e idioma
    const preferredLocale = guild.preferredLocale || 'Desconocido';

    // Fecha en la que el bot se unió al servidor
    const botJoinedAt = moment(guild.members.cache.get(client.user.id).joinedAt).format('DD/MM/YYYY HH:mm:ss');
    const botJoinedAgo = moment(guild.members.cache.get(client.user.id).joinedAt).fromNow();

    // Emoji personalizado (se muestra cuántos emojis personalizados tiene el servidor)
    const customEmojis = guild.emojis.cache.size;

    // Limitar a los primeros 20 emojis
    const emojis = guild.emojis.cache.map(emoji => emoji.toString()).slice(0, 20).join(' ') || 'No hay emojis personalizados.';
    
    // Limitar a los primeros 20 GIFs
    const gifEmojis = guild.emojis.cache.filter(emoji => emoji.animated).map(emoji => emoji.toString()).slice(0, 20).join(' ') || 'No hay GIFs personalizados.';

    // Actividad de la comunidad (se puede hacer con el número de miembros en línea o con "no molestar")
    const onlineMembers = guild.members.cache.filter(member => member.presence?.status !== 'offline' && (member.presence?.status === 'online' || member.presence?.status === 'dnd')).size;
    const activeCommunity = onlineMembers >= 5 ? '¡Comunidad activa!' : 'Comunidad poco activa';

    // Descripción del servidor (si está disponible)
    const description = guild.description || 'No hay descripción disponible.';

    // Verificar si el servidor tiene la opción de comunidad habilitada
    const isCommunity = guild.features.includes('COMMUNITY') ? '¡Este servidor está habilitado como una comunidad!' : 'Este servidor no está habilitado como comunidad.';

    // Generación del embed
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Información del Servidor: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Dueño', value: `<@${owner.id}> (${owner.user.tag} - id: ${owner.id})`, inline: true },
        { name: 'Creado el', value: `${createdAt}\n(${createdAgo})`, inline: false },
        { name: 'Fecha de unión del Bot', value: `${botJoinedAt}\n(${botJoinedAgo})`, inline: false },
        { name: 'Miembros', value: guild.memberCount.toString(), inline: true },
        { name: 'Humanos', value: guild.members.cache.filter(member => !member.user.bot).size.toString(), inline: true },
        { name: 'Bots', value: guild.members.cache.filter(member => member.user.bot).size.toString(), inline: true },
        { name: 'Canales de Texto', value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size.toString(), inline: true },
        { name: 'Canales de Voz', value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size.toString(), inline: true },
        { name: 'Categorías', value: guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size.toString(), inline: true },
        { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: 'Emojis Personalizados', value: customEmojis.toString(), inline: true },
        { name: 'Impulsos', value: guild.premiumSubscriptionCount?.toString() || '0', inline: true },
        { name: 'Nivel de Impulso', value: guild.premiumTier?.toString() || 'Sin nivel', inline: true },
        { name: 'Nivel de Verificación', value: verificationLevels[guild.verificationLevel], inline: true },
        { name: 'Idioma', value: preferredLocale, inline: true },
        { name: 'Descripción', value: description, inline: false },
        { name: 'Actividad de la Comunidad', value: activeCommunity, inline: false },
        { name: 'Estado de Comunidad', value: isCommunity, inline: false }
      )
      .setTimestamp();

    // Agregar emojis y GIFs debajo del embed
    embed.addFields(
      { name: 'Emojis:', value: emojis, inline: false },
      { name: 'GIFs:', value: gifEmojis, inline: false }
    );

    await message.reply({ embeds: [embed] });
  },
};
