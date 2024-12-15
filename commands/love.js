const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'love',
  description: 'Calcula el porcentaje de amor entre dos usuarios',
  usage: 'c!love [@usuario]',
  run: async (client, message, args) => {
    const target = message.mentions.users.first() || message.author;
    const lovePercentage = Math.floor(Math.random() * 101);

    const embed = createLoveEmbed(message.author, target, lovePercentage);
    message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('love')
    .setDescription('Calcula el porcentaje de amor entre dos usuarios')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario con quien calcular el amor')
        .setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    const lovePercentage = Math.floor(Math.random() * 101);

    const embed = createLoveEmbed(interaction.user, target, lovePercentage);
    interaction.reply({ embeds: [embed] });
  },
};

function createLoveEmbed(user1, user2, percentage) {
  const hearts = '❤️'.repeat(Math.floor(percentage / 10)) + '🖤'.repeat(10 - Math.floor(percentage / 10));

  return new EmbedBuilder()
    .setColor('#FF69B4')
    .setTitle('Medidor de Amor ❤️')
    .setDescription(`El amor entre ${user1} y ${user2} es:`)
    .addFields(
      { name: 'Porcentaje', value: `${percentage}%`, inline: true },
      { name: 'Medidor', value: hearts, inline: true }
    )
    .setFooter({ text: 'Recuerda que el amor verdadero va más allá de los números!' });
}

