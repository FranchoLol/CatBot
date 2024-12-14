const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'bans',
  description: 'Muestra una lista de los usuarios baneados',
  usage: 'c!bans',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('No tienes permiso para ver la lista de usuarios baneados.');
    }

    try {
      const bans = await message.guild.bans.fetch();
      
      if (bans.size === 0) {
        return message.reply('No hay usuarios baneados en este servidor.');
      }

      const embed = new EmbedBuilder()
        .setTitle('Usuarios Baneados')
        .setColor('#FF0000')
        .setDescription(bans.map(ban => {
          const ipBan = ban.reason && ban.reason.toLowerCase().includes('ip ban');
          return `- ${ban.user.tag} (${ban.user.id}) | BanIP: [${ipBan ? 'true' : 'false'}]`;
        }).join('\n'))
        .setFooter({ text: `Total de baneados: ${bans.size}` });

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error al obtener la lista de baneados:', error);
      message.reply('Hubo un error al obtener la lista de usuarios baneados.');
    }
  },
  data: new SlashCommandBuilder()
    .setName('bans')
    .setDescription('Muestra una lista de los usuarios baneados'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'No tienes permiso para ver la lista de usuarios baneados.', ephemeral: true });
    }

    try {
      const bans = await interaction.guild.bans.fetch();
      
      if (bans.size === 0) {
        return interaction.reply('No hay usuarios baneados en este servidor.');
      }

      const embed = new EmbedBuilder()
        .setTitle('Usuarios Baneados')
        .setColor('#FF0000')
        .setDescription(bans.map(ban => {
          const ipBan = ban.reason && ban.reason.toLowerCase().includes('ip ban');
          return `- ${ban.user.tag} (${ban.user.id}) | BanIP: [${ipBan ? 'true' : 'false'}]`;
        }).join('\n'))
        .setFooter({ text: `Total de baneados: ${bans.size}` });

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error al obtener la lista de baneados:', error);
      interaction.reply({ content: 'Hubo un error al obtener la lista de usuarios baneados.', ephemeral: true });
    }
  },
};

