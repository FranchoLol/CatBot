const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const autoroleFile = path.join(__dirname, '..', 'data', 'autoroles.json');

async function getAutoroles() {
  try {
    const data = await fs.readFile(autoroleFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function saveAutoroles(autoroles) {
  await fs.writeFile(autoroleFile, JSON.stringify(autoroles, null, 2));
}

module.exports = {
  name: 'autoroleremove',
  description: 'Elimina roles automáticos para usuarios o bots',
  usage: 'c!autoroleremove [user/bot] [@rol1,@rol2,...]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    if (args.length < 2) {
      return message.reply('Uso correcto: c!autoroleremove [user/bot] [@rol1,@rol2,...]');
    }

    const type = args[0].toLowerCase();
    if (type !== 'user' && type !== 'bot') {
      return message.reply('El tipo debe ser "user" o "bot".');
    }

    const roles = message.mentions.roles;
    if (roles.size === 0) {
      return message.reply('Por favor, menciona al menos un rol.');
    }

    const autoroles = await getAutoroles();
    if (!autoroles[message.guild.id] || !autoroles[message.guild.id][type]) {
      return message.reply(`No hay roles automáticos configurados para ${type === 'user' ? 'usuarios' : 'bots'}.`);
    }

    roles.forEach(role => {
      const index = autoroles[message.guild.id][type].indexOf(role.id);
      if (index > -1) {
        autoroles[message.guild.id][type].splice(index, 1);
      }
    });

    await saveAutoroles(autoroles);

    message.reply(`Roles automáticos para ${type === 'user' ? 'usuarios' : 'bots'} actualizados.`);
  },
  data: new SlashCommandBuilder()
    .setName('autoroleremove')
    .setDescription('Elimina roles automáticos para usuarios o bots')
    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('Tipo de entidad (user/bot)')
        .setRequired(true)
        .addChoices(
          { name: 'Usuario', value: 'user' },
          { name: 'Bot', value: 'bot' }
        ))
    .addStringOption(option =>
      option.setName('roles')
        .setDescription('IDs de los roles separados por comas')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const type = interaction.options.getString('tipo');
    const rolesInput = interaction.options.getString('roles');
    const roleIds = rolesInput.split(',').map(id => id.trim());

    const autoroles = await getAutoroles();
    if (!autoroles[interaction.guild.id] || !autoroles[interaction.guild.id][type]) {
      return interaction.reply(`No hay roles automáticos configurados para ${type === 'user' ? 'usuarios' : 'bots'}.`);
    }

    roleIds.forEach(roleId => {
      const index = autoroles[interaction.guild.id][type].indexOf(roleId);
      if (index > -1) {
        autoroles[interaction.guild.id][type].splice(index, 1);
      }
    });

    await saveAutoroles(autoroles);

    interaction.reply(`Roles automáticos para ${type === 'user' ? 'usuarios' : 'bots'} actualizados.`);
  },
};

