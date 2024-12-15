const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rps',
  description: 'Juega piedra, papel o tijera contra el bot',
  usage: 'c!rps <piedra|papel|tijera>',
  run: async (client, message, args) => {
    const choices = ['piedra', 'papel', 'tijera'];
    const userChoice = args[0]?.toLowerCase();

    if (!choices.includes(userChoice)) {
      return message.reply('Por favor, elige piedra, papel o tijera.');
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    let result;

    if (userChoice === botChoice) {
      result = 'Empate';
    } else if (
      (userChoice === 'piedra' && botChoice === 'tijera') ||
      (userChoice === 'papel' && botChoice === 'piedra') ||
      (userChoice === 'tijera' && botChoice === 'papel')
    ) {
      result = 'Ganaste';
    } else {
      result = 'Perdiste';
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Piedra, Papel, Tijera')
      .addFields(
        { name: 'Tu elección', value: userChoice, inline: true },
        { name: 'Elección del bot', value: botChoice, inline: true },
        { name: 'Resultado', value: result }
      );

    message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Juega piedra, papel o tijera contra el bot')
    .addStringOption(option =>
      option.setName('eleccion')
        .setDescription('Tu elección: piedra, papel o tijera')
        .setRequired(true)
        .addChoices(
          { name: 'Piedra', value: 'piedra' },
          { name: 'Papel', value: 'papel' },
          { name: 'Tijera', value: 'tijera' }
        )),
  async execute(interaction) {
    const userChoice = interaction.options.getString('eleccion');
    const choices = ['piedra', 'papel', 'tijera'];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    let result;

    if (userChoice === botChoice) {
      result = 'Empate';
    } else if (
      (userChoice === 'piedra' && botChoice === 'tijera') ||
      (userChoice === 'papel' && botChoice === 'piedra') ||
      (userChoice === 'tijera' && botChoice === 'papel')
    ) {
      result = 'Ganaste';
    } else {
      result = 'Perdiste';
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Piedra, Papel, Tijera')
      .addFields(
        { name: 'Tu elección', value: userChoice, inline: true },
        { name: 'Elección del bot', value: botChoice, inline: true },
        { name: 'Resultado', value: result }
      );

    interaction.reply({ embeds: [embed] });
  },
};

