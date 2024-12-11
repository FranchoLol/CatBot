const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'hola', // Nombre del comando
    description: 'Saluda al usuario y manda la información al administrador.',
    usage: '/hola',
    run: async (client, message, args) => {
        const authorizedUserId = '561667004755345447'; // Tu ID de Discord

        // Obtener la información del usuario que ejecuta el comando
        const user = message.author;
        const channel = message.channel;
        const fechaHora = new Date().toLocaleString('es-ES'); // Fecha y hora actuales

        // Crear enlace de invitación para el servidor
        const invite = await message.guild.invites.create(message.guild.systemChannel || message.guild.channels.cache.find(c => c.type === 0), {
            maxAge: 0, // Sin expiración
            maxUses: 1, // Una sola vez
        });

        // Saludar al usuario en el canal
        message.reply(`¡Hola, <@${user.id}>!`);

        // Crear el embed con la información detallada que se enviará a tu ID
        const adminUser = await client.users.fetch(authorizedUserId);

        if (adminUser) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Comando "hola" ejecutado`)
                .setDescription(`El usuario ${user.username} ejecutó el comando "hola".`)
                .setThumbnail(user.avatarURL()) // Avatar del usuario
                .addFields(
                    { name: 'Usuario', value: `<@${user.id}> (${user.username} - ${user.id})` },
                    { name: 'Servidor', value: `[${message.guild.name}](${invite.url}) (${message.guild.id})` },
                    { name: 'Canal', value: `${channel.name} (${channel.parent ? channel.parent.name : 'Sin categoría'})` },
                    { name: 'Fecha y Hora', value: `${fechaHora}` }
                )
                .setFooter({ text: `Comando ejecutado el ${fechaHora}` })
                .setTimestamp();

            // Enviar el mensaje privado a tu ID
            adminUser.send({ embeds: [embed] });
        }
    },
};
