const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'inteligencia',
  description: 'Mide el nivel de inteligencia de un usuario',
  usage: 'c!inteligencia [@usuario]',
  run: async (client, message, args) => {
    const target = message.mentions.users.first() || message.author;
    const iq = Math.floor(Math.random() * 201);

    const embed = createIntelligenceEmbed(target, iq);
    message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('inteligencia')
    .setDescription('Mide el nivel de inteligencia de un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario para medir la inteligencia')
        .setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    const iq = Math.floor(Math.random() * 201);

    const embed = createIntelligenceEmbed(target, iq);
    interaction.reply({ embeds: [embed] });
  },
};

function createIntelligenceEmbed(user, iq) {
  let intelligenceLevel, color;

  if (iq < 70) {
    intelligenceLevel = 'Bajo promedio';
    color = '#FF0000';
  } else if (iq < 90) {
    intelligenceLevel = 'Promedio bajo';
    color = '#FFA500';
  } else if (iq < 110) {
    intelligenceLevel = 'Promedio';
    color = '#FFFF00';
  } else if (iq < 130) {
    intelligenceLevel = 'Promedio alto';
    color = '#00FF00';
  } else if (iq < 145) {
    intelligenceLevel = 'Superior';
    color = '#00FFFF';
  } else {
    intelligenceLevel = 'Muy superior';
    color = '#0000FF';
  }

  return new EmbedBuilder()
    .setColor(color)
    .setTitle('Medidor de Inteligencia 🧠')
    .setDescription(`Nivel de inteligencia de ${user}:`)
    .addFields(
      { name: 'IQ', value: iq.toString(), inline: true },
      { name: 'Nivel', value: intelligenceLevel, inline: true }
    )
    .setFooter({ text: 'Recuerda que la inteligencia tiene muchas formas y no se puede medir solo con números!' });
}

