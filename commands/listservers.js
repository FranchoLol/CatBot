const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'listservers', // Nombre del comando
    description: 'Lista los servidores donde está el bot (solo para usuarios autorizados)',
    usage: '/listservers',
    adminOnly: true, // Indica que solo es para usuarios autorizados
    run: async (client, message, args) => {
        const authorizedUserId = '561667004755345447'; // Reemplaza con tu ID

        // Verificar si el usuario tiene permiso
        if (message.author.id !== authorizedUserId) {
            return message.reply('❌ No tienes permiso para usar este comando.');
        }

        // Construir la lista de servidores
        let response = '**Lista de servidores:**\n\n';
        for (const [id, guild] of client.guilds.cache) {
            try {
                // Crear invitación (requiere permisos)
                const invite = await guild.invites.create(guild.systemChannel || guild.channels.cache.find(c => c.type === 0), {
                    maxAge: 0, // Sin expiración
                    maxUses: 1, // Una sola vez
                });

                response += `**${guild.name}** - [Invitación](${invite.url})\n`;
            } catch (error) {
                response += `**${guild.name}** - No se pudo generar un enlace de invitación.\n`;
            }
        }

        // Enviar respuesta al usuario por mensaje directo
        try {
            await message.author.send(response);
            message.reply('✅ Te he enviado la lista de servidores por mensaje directo.');
        } catch (error) {
            message.reply('❌ No pude enviarte la lista por mensaje directo. Asegúrate de tenerlos habilitados.');
        }
    },
    data: {
        name: 'listservers',
        description: 'Lista los servidores donde está el bot (solo para usuarios autorizados)',
    },
    async execute(interaction) {
        const authorizedUserId = '561667004755345447'; // Reemplaza con tu ID

        // Verificar si el usuario tiene permiso
        if (interaction.user.id !== authorizedUserId) {
            return interaction.reply({ content: '❌ No tienes permiso para usar este comando.', ephemeral: true });
        }

        // Construir la lista de servidores
        let response = '**Lista de servidores:**\n\n';
        for (const [id, guild] of interaction.client.guilds.cache) {
            try {
                // Crear invitación (requiere permisos)
                const invite = await guild.invites.create(guild.systemChannel || guild.channels.cache.find(c => c.type === 0), {
                    maxAge: 0, // Sin expiración
                    maxUses: 1, // Una sola vez
                });

                response += `**${guild.name}** - [Invitación](${invite.url})\n`;
            } catch (error) {
                response += `**${guild.name}** - No se pudo generar un enlace de invitación.\n`;
            }
        }

        // Enviar respuesta al usuario por mensaje directo
        try {
            await interaction.user.send(response);
            interaction.reply({ content: '✅ Te he enviado la lista de servidores por mensaje directo.', ephemeral: true });
        } catch (error) {
            interaction.reply({ content: '❌ No pude enviarte la lista por mensaje directo. Asegúrate de tenerlos habilitados.', ephemeral: true });
        }
    },
};
