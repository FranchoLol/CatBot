const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const mutesFile = path.join(__dirname, '..', 'data', 'mutes.json');

function getMutes() {
  if (!fs.existsSync(mutesFile)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(mutesFile, 'utf8'));
}

function saveMutes(mutes) {
  fs.writeFileSync(mutesFile, JSON.stringify(mutes, null, 2));
}

module.exports = {
  name: 'mute',
  description: 'Silencia a un usuario',
  usage: 'c!mute <@usuario/ID> [duración] [razón]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('No tienes permiso para silenciar usuarios.');
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply('Por favor, menciona o proporciona la ID de un usuario válido.');
    }

    let duration = args[1] ? ms(args[1]) : null;
    const reason = args.slice(duration ? 2 : 1).join(' ') || 'No se proporcionó una razón';

    if (duration && isNaN(duration)) {
      return message.reply('Por favor, proporciona una duración válida (e.g., 1h, 30m, 1d).');
    }

    try {
      await target.timeout(duration, reason);
    } catch (error) {
      console.error('Error al silenciar al usuario:', error);
      return message.reply('Hubo un error al intentar silenciar al usuario.');
    }

    const mutes = getMutes();
    if (!mutes[message.guild.id]) mutes[message.guild.id] = {};
    mutes[message.guild.id][target.id] = {
      moderator: message.author.id,
      reason: reason,
      duration: duration,
      startTime: Date.now()
    };
    saveMutes(mutes);

    message.reply(`${target.user.tag} ha sido silenciado. ${duration ? `Duración: ${ms(duration, { long: true })}` : 'Duración: Indefinida'} | Razón: ${reason}`);
  },
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Silencia a un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario a silenciar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duracion')
        .setDescription('Duración del silencio (e.g., 1h, 30m, 1d)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón del silencio')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'No tienes permiso para silenciar usuarios.', ephemeral: true });
    }

    const target = interaction.options.getMember('usuario');
    const durationString = interaction.options.getString('duracion');
    const reason = interaction.options.getString('razon') || 'No se proporcionó una razón';

    let duration = durationString ? ms(durationString) : null;

    if (durationString && isNaN(duration)) {
      return interaction.reply({ content: 'Por favor, proporciona una duración válida (e.g., 1h, 30m, 1d).', ephemeral: true });
    }

    try {
      await target.timeout(duration, reason);
    } catch (error) {
      console.error('Error al silenciar al usuario:', error);
      return interaction.reply({ content: 'Hubo un error al intentar silenciar al usuario.', ephemeral: true });
    }

    const mutes = getMutes();
    if (!mutes[interaction.guild.id]) mutes[interaction.guild.id] = {};
    mutes[interaction.guild.id][target.id] = {
      moderator: interaction.user.id,
      reason: reason,
      duration: duration,
      startTime: Date.now()
    };
    saveMutes(mutes);

    interaction.reply(`${target.user.tag} ha sido silenciado. ${duration ? `Duración: ${ms(duration, { long: true })}` : 'Duración: Indefinida'} | Razón: ${reason}`);
  },
};

