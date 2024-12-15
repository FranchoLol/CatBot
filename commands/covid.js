const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'covid',
  description: 'Calcula el riesgo de COVID de un usuario',
  usage: 'c!covid [@usuario]',
  run: async (client, message, args) => {
    const target = message.mentions.users.first() || message.author;
    const riskPercentage = Math.floor(Math.random() * 101);

    const embed = createCovidEmbed(target, riskPercentage);
    message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('covid')
    .setDescription('Calcula el riesgo de COVID de un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario para calcular el riesgo de COVID')
        .setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    const riskPercentage = Math.floor(Math.random() * 101);

    const embed = createCovidEmbed(target, riskPercentage);
    interaction.reply({ embeds: [embed] });
  },
};

function createCovidEmbed(user, percentage) {
  let riskLevel, color;

  if (percentage < 30) {
    riskLevel = 'Bajo';
    color = '#00FF00';
  } else if (percentage < 60) {
    riskLevel = 'Moderado';
    color = '#FFFF00';
  } else if (percentage < 80) {
    riskLevel = 'Alto';
    color = '#FFA500';
  } else {
    riskLevel = 'Muy Alto';
    color = '#FF0000';
  }

  return new EmbedBuilder()
    .setColor(color)
    .setTitle('Riesgo de COVID-19')
    .setDescription(`Riesgo de COVID para ${user}:`)
    .addFields(
      { name: 'Porcentaje', value: `${percentage}%`, inline: true },
      { name: 'Nivel de Riesgo', value: riskLevel, inline: true }
    )
    .setFooter({ text: 'Recuerda seguir las medidas de prevención recomendadas!' });
}

