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
  name: 'unmute',
  description: 'Quita el silencio a un usuario',
  usage: 'c!unmute <@usuario/ID>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('No tienes permiso para quitar el silencio a usuarios.');
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply('Por favor, menciona o proporciona la ID de un usuario válido.');
    }

    try {
      await target.timeout(null);
    } catch (error) {
      console.error('Error al quitar el silencio al usuario:', error);
      return message.reply('Hubo un error al intentar quitar el silencio al usuario.');
    }

    const mutes = getMutes();
    if (mutes[message.guild.id] && mutes[message.guild.id][target.id]) {
      delete mutes[message.guild.id][target.id];
      saveMutes(mutes);
    }

    message.reply(`Se ha quitado el silencio a ${target.user.tag}.`);
  },
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Quita el silencio a un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario al que quitar el silencio')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'No tienes permiso para quitar el silencio a usuarios.', ephemeral: true });
    }

    const target = interaction.options.getMember('usuario');

    try {
      await target.timeout(null);
    } catch (error) {
      console.error('Error al quitar el silencio al usuario:', error);
      return interaction.reply({ content: 'Hubo un error al intentar quitar el silencio al usuario.', ephemeral: true });
    }

    const mutes = getMutes();
    if (mutes[interaction.guild.id] && mutes[interaction.guild.id][target.id]) {
      delete mutes[interaction.guild.id][target.id];
      saveMutes(mutes);
    }

    interaction.reply(`Se ha quitado el silencio a ${target.user.tag}.`);
  },
};

