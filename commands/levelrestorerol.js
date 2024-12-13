const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { removeLimitedRole, getLimitedRoles } = require('../utils/experienceUtils');

module.exports = {
  name: 'levelrestorerol',
  description: 'Restaura la ganancia de XP para roles específicos',
  usage: 'c!levelrestorerol @rol1 @rol2 ...',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const limitedRoles = getLimitedRoles(message.guild.id);

    if (limitedRoles.length === 0) {
      return message.reply('No hay roles limitados para restaurar.');
    }

    if (args.length === 0) {
      const roleMentions = limitedRoles.map(id => `<@&${id}>`).join(', ');
      return message.reply(`Roles limitados actuales: ${roleMentions}\nUsa \`c!levelrestorerol @rol1 @rol2 ...\` para restaurar roles específicos.`);
    }

    const roles = message.mentions.roles;
    if (roles.size === 0) {
      return message.reply('Por favor, menciona al menos un rol válido.');
    }

    roles.forEach(role => {
      removeLimitedRole(message.guild.id, role.id);
    });

    const updatedLimitedRoles = getLimitedRoles(message.guild.id);
    const roleMentions = updatedLimitedRoles.length > 0 
      ? updatedLimitedRoles.map(id => `<@&${id}>`).join(', ')
      : 'Ninguno';

    message.reply(`Roles restaurados. Los siguientes roles siguen sin ganar XP: ${roleMentions}`);
  },
  data: new SlashCommandBuilder()
    .setName('levelrestorerol')
    .setDescription('Restaura la ganancia de XP para roles específicos')
    .addStringOption(option =>
      option.setName('roles')
        .setDescription('Los roles a restaurar (separados por espacios)')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const limitedRoles = getLimitedRoles(interaction.guild.id);

    if (limitedRoles.length === 0) {
      return interaction.reply('No hay roles limitados para restaurar.');
    }

    const rolesInput = interaction.options.getString('roles');

    if (!rolesInput) {
      const roleMentions = limitedRoles.map(id => `<@&${id}>`).join(', ');
      return interaction.reply(`Roles limitados actuales: ${roleMentions}\nUsa \`/levelrestorerol roles:@rol1 @rol2 ...\` para restaurar roles específicos.`);
    }

    const roleIds = rolesInput.split(/\s+/).map(id => id.replace(/[<@&>]/g, ''));

    roleIds.forEach(id => {
      removeLimitedRole(interaction.guild.id, id);
    });

    const updatedLimitedRoles = getLimitedRoles(interaction.guild.id);
    const roleMentions = updatedLimitedRoles.length > 0 
      ? updatedLimitedRoles.map(id => `<@&${id}>`).join(', ')
      : 'Ninguno';

    interaction.reply(`Roles restaurados. Los siguientes roles siguen sin ganar XP: ${roleMentions}`);
  },
};

