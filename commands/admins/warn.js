const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warnsPath = path.join(__dirname, '..', 'data', 'warns.json');

function getWarns() {
  if (!fs.existsSync(warnsPath)) {
    fs.writeFileSync(warnsPath, '{}', 'utf8');
    return {};
  }
  return JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
}

function saveWarns(warns) {
  fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2), 'utf8');
}

module.exports = {
  name: 'warn',
  description: 'Advierte a un usuario',
  usage: 'c!warn @usuario [fecha fin(opcional)] [razón]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('No tienes permiso para advertir a usuarios.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Por favor, menciona a un usuario para advertir.');
    }

    args.shift(); // Remove the user mention from args
    let endDate = null;
    let reason = args.join(' ');

    // Check if the next argument is a valid date
    if (args[0] && !isNaN(Date.parse(args[0]))) {
      endDate = new Date(args.shift());
      reason = args.join(' ');
    }

    const warns = getWarns();
    if (!warns[message.guild.id]) warns[message.guild.id] = {};
    if (!warns[message.guild.id][user.id]) warns[message.guild.id][user.id] = [];

    const warn = {
      reason: reason || 'No se proporcionó una razón',
      date: new Date().toISOString(),
      moderator: message.author.id,
      endDate: endDate ? endDate.toISOString() : null
    };

    warns[message.guild.id][user.id].push(warn);
    saveWarns(warns);

    message.reply(`Se ha advertido a ${user.tag}. Razón: ${warn.reason}`);
  },
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Advierte a un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario a advertir')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('fecha_fin')
        .setDescription('Fecha de finalización de la advertencia (opcional)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón de la advertencia')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'No tienes permiso para advertir a usuarios.', ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const endDateString = interaction.options.getString('fecha_fin');
    const reason = interaction.options.getString('razon') || 'No se proporcionó una razón';

    let endDate = null;
    if (endDateString) {
      endDate = new Date(endDateString);
      if (isNaN(endDate.getTime())) {
        return interaction.reply({ content: 'La fecha proporcionada no es válida.', ephemeral: true });
      }
    }

    const warns = getWarns();
    if (!warns[interaction.guild.id]) warns[interaction.guild.id] = {};
    if (!warns[interaction.guild.id][user.id]) warns[interaction.guild.id][user.id] = [];

    const warn = {
      reason: reason,
      date: new Date().toISOString(),
      moderator: interaction.user.id,
      endDate: endDate ? endDate.toISOString() : null
    };

    warns[interaction.guild.id][user.id].push(warn);
    saveWarns(warns);

    interaction.reply(`Se ha advertido a ${user.tag}. Razón: ${warn.reason}`);
  },
};

