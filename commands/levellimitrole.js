const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const { addLimitedRole, getLimitedRoles } = require('../utils/experienceUtils');

module.exports = {
  name: 'levellimitrole',
  description: 'Limita la ganancia de XP para roles específicos',
  usage: 'c!levellimitrole @rol1 @rol2 ...',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const roles = message.mentions.roles;
    if (roles.size === 0) {
      return message.reply('Por favor, menciona al menos un rol.');
    }

    roles.forEach(role => {
      addLimitedRole(message.guild.id, role.id);
    });

    const limitedRoles = getLimitedRoles(message.guild.id);
    const roleMentions = limitedRoles.map(id => `<@&${id}>`).join(', ');

    message.reply(`Roles limitados actualizados. Los siguientes roles no ganarán XP: ${roleMentions}`);
  },
  data: new SlashCommandBuilder()
    .setName('levellimitrole')
    .setDescription('Limita la ganancia de XP para roles específicos')
    .addStringOption(option =>
      option.setName('roles')
        .setDescription('Los roles a limitar (separados por espacios)')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const rolesInput = interaction.options.getString('roles');
    const roleIds = rolesInput.split(/\s+/).map(id => id.replace(/[<@&>]/g, ''));

    roleIds.forEach(id => {
      addLimitedRole(interaction.guild.id, id);
    });

    const limitedRoles = getLimitedRoles(interaction.guild.id);
    const roleMentions = limitedRoles.map(id => `<@&${id}>`).join(', ');

    interaction.reply(`Roles limitados actualizados. Los siguientes roles no ganarán XP: ${roleMentions}`);
  },
};

