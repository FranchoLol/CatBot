const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const birthdayConfigPath = path.join(__dirname, '..', 'data', 'birthdayConfig.json');

module.exports = {
  name: 'setbirthdaychannel',
  description: 'Establece el canal para los mensajes de cumpleaños',
  usage: 'c!setbirthdaychannel <#canal>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('No tienes permiso para usar este comando.');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('Por favor, menciona un canal válido.');
    }

    setBirthdayChannel(message.guild.id, channel.id);
    message.reply(`El canal de cumpleaños se ha establecido en ${channel}.`);
  },
  data: new SlashCommandBuilder()
    .setName('setbirthdaychannel')
    .setDescription('Establece el canal para los mensajes de cumpleaños')
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('El canal para los mensajes de cumpleaños')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('canal');
    setBirthdayChannel(interaction.guildId, channel.id);
    interaction.reply(`El canal de cumpleaños se ha establecido en ${channel}.`);
  },
};

function setBirthdayChannel(guildId, channelId) {
  let config = {};
  if (fs.existsSync(birthdayConfigPath)) {
    config = JSON.parse(fs.readFileSync(birthdayConfigPath, 'utf8'));
  }
  config[guildId] = { channelId };
  fs.writeFileSync(birthdayConfigPath, JSON.stringify(config, null, 2));
}

