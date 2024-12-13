const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warnsPath = path.join(__dirname, '..', 'data', 'warns.json');

function getWarns() {
  if (!fs.existsSync(warnsPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
}

function saveWarns(warns) {
  fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2), 'utf8');
}

module.exports = {
  name: 'delwarn',
  description: 'Elimina una advertencia de un usuario',
  usage: 'c!delwarn @usuario/id número_advertencia',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('No tienes permiso para eliminar advertencias.');
    }

    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) {
      return message.reply('Por favor, menciona a un usuario o proporciona su ID.');
    }

    const warnNumber = parseInt(args[1]);
    if (isNaN(warnNumber) || warnNumber < 1) {
      return message.reply('Por favor, proporciona un número de advertencia válido.');
    }

    const warns = getWarns();
    const userWarns = warns[message.guild.id]?.[user.id] || [];

    if (warnNumber > userWarns.length) {
      return message.reply(`El usuario solo tiene ${userWarns.length} advertencia(s).`);
    }

    const removedWarn = userWarns.splice(warnNumber - 1, 1)[0];
    warns[message.guild.id][user.id] = userWarns;
    saveWarns(warns);

    message.reply(`Se ha eliminado la advertencia ${warnNumber} de ${user.tag}. Razón original: ${removedWarn.reason}`);
  },
  data: new SlashCommandBuilder()
    .setName('delwarn')
    .setDescription('Elimina una advertencia de un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario del que quieres eliminar la advertencia')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('numero_advertencia')
        .setDescription('El número de la advertencia a eliminar')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'No tienes permiso para eliminar advertencias.', ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const warnNumber = interaction.options.getInteger('numero_advertencia');

    if (warnNumber < 1) {
      return interaction.reply({ content: 'Por favor, proporciona un número de advertencia válido.', ephemeral: true });
    }

    const warns = getWarns();
    const userWarns = warns[interaction.guild.id]?.[user.id] || [];

    if (warnNumber > userWarns.length) {
      return interaction.reply({ content: `El usuario solo tiene ${userWarns.length} advertencia(s).`, ephemeral: true });
    }

    const removedWarn = userWarns.splice(warnNumber - 1, 1)[0];
    warns[interaction.guild.id][user.id] = userWarns;
    saveWarns(warns);

    interaction.reply(`Se ha eliminado la advertencia ${warnNumber} de ${user.tag}. Razón original: ${removedWarn.reason}`);
  },
};

