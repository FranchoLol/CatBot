const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'assignrole',
  description: 'Asigna uno o varios roles a un usuario',
  usage: 'c!assignrole @usuario @rol1 @rol2 ...',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('No tienes permiso para asignar roles.');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Por favor, menciona a un usuario.');
    }

    const roles = message.mentions.roles;
    if (roles.size === 0) {
      return message.reply('Por favor, menciona al menos un rol para asignar.');
    }

    let assignedRoles = [];
    let failedRoles = [];

    for (const [, role] of roles) {
      try {
        await member.roles.add(role);
        assignedRoles.push(role.name);
      } catch (error) {
        failedRoles.push(role.name);
        console.error(`Error al asignar el rol ${role.name}:`, error);
      }
    }

    let response = `Roles asignados a ${member.user.tag}:\n`;
    if (assignedRoles.length > 0) {
      response += `✅ Asignados: ${assignedRoles.join(', ')}\n`;
    }
    if (failedRoles.length > 0) {
      response += `❌ No se pudieron asignar: ${failedRoles.join(', ')}`;
    }

    message.reply(response);
  },
  data: new SlashCommandBuilder()
    .setName('assignrole')
    .setDescription('Asigna uno o varios roles a un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario al que asignar los roles')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('roles')
        .setDescription('Los roles a asignar (separados por espacios)')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'No tienes permiso para asignar roles.', ephemeral: true });
    }

    const member = interaction.options.getMember('usuario');
    const rolesInput = interaction.options.getString('roles');
    const roleIds = rolesInput.split(/\s+/).map(id => id.replace(/[<@&>]/g, ''));

    let assignedRoles = [];
    let failedRoles = [];

    for (const roleId of roleIds) {
      const role = interaction.guild.roles.cache.get(roleId);
      if (role) {
        try {
          await member.roles.add(role);
          assignedRoles.push(role.name);
        } catch (error) {
          failedRoles.push(role.name);
          console.error(`Error al asignar el rol ${role.name}:`, error);
        }
      } else {
        failedRoles.push(roleId);
      }
    }

    let response = `Roles asignados a ${member.user.tag}:\n`;
    if (assignedRoles.length > 0) {
      response += `✅ Asignados: ${assignedRoles.join(', ')}\n`;
    }
    if (failedRoles.length > 0) {
      response += `❌ No se pudieron asignar: ${failedRoles.join(', ')}`;
    }

    interaction.reply(response);
  },
};

