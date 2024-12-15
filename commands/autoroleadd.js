const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const autoroleFile = path.join(dataDir, 'autoroles.json');

async function getAutoroles() {
  try {
    await fsPromises.access(dataDir);
  } catch (error) {
    await fsPromises.mkdir(dataDir, { recursive: true });
  }

  try {
    const data = await fsPromises.readFile(autoroleFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function saveAutoroles(autoroles) {
  await fsPromises.writeFile(autoroleFile, JSON.stringify(autoroles, null, 2));
}

module.exports = {
  name: 'autoroleadd',
  description: 'Añade roles automáticos para usuarios o bots',
  usage: 'c!autoroleadd [user/bot] [@rol1,@rol2,...]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    if (args.length < 2) {
      return message.reply('Uso correcto: c!autoroleadd [user/bot] [@rol1,@rol2,...]');
    }

    const type = args[0].toLowerCase();
    if (type !== 'user' && type !== 'bot') {
      return message.reply('El tipo debe ser "user" o "bot".');
    }

    const roles = message.mentions.roles;
    if (roles.size === 0) {
      return message.reply('Por favor, menciona al menos un rol.');
    }

    try {
      const autoroles = await getAutoroles();
      if (!autoroles[message.guild.id]) {
        autoroles[message.guild.id] = { user: [], bot: [] };
      }

      roles.forEach(role => {
        if (!autoroles[message.guild.id][type].includes(role.id)) {
          autoroles[message.guild.id][type].push(role.id);
        }
      });

      await saveAutoroles(autoroles);

      message.reply(`Roles automáticos para ${type === 'user' ? 'usuarios' : 'bots'} actualizados.`);
    } catch (error) {
      console.error('Error al guardar los autoroles:', error);
      message.reply('Hubo un error al guardar los roles automáticos. Por favor, inténtalo de nuevo más tarde.');
    }
  },
  data: new SlashCommandBuilder()
    .setName('autoroleadd')
    .setDescription('Añade roles automáticos para usuarios o bots')
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

    try {
      const autoroles = await getAutoroles();
      if (!autoroles[interaction.guild.id]) {
        autoroles[interaction.guild.id] = { user: [], bot: [] };
      }

      roleIds.forEach(roleId => {
        if (!autoroles[interaction.guild.id][type].includes(roleId)) {
          autoroles[interaction.guild.id][type].push(roleId);
        }
      });

      await saveAutoroles(autoroles);

      interaction.reply(`Roles automáticos para ${type === 'user' ? 'usuarios' : 'bots'} actualizados.`);
    } catch (error) {
      console.error('Error al guardar los autoroles:', error);
      interaction.reply({ content: 'Hubo un error al guardar los roles automáticos. Por favor, inténtalo de nuevo más tarde.', ephemeral: true });
    }
  },
};

