const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Muestra la latencia del bot',
    run: async (client, message, args) => {
      const sent = await message.reply('Calculando ping...');
      sent.edit(`Pong! La latencia es ${sent.createdTimestamp - message.createdTimestamp}ms. La latencia de la API es ${Math.round(client.ws.ping)}ms`);
    },
    data: {
      name: 'ping',
      description: 'Muestra la latencia del bot',
    },
    async execute(interaction) {
      const sent = await interaction.reply({ content: 'Calculando ping...', fetchReply: true });
      interaction.editReply(`Pong! La latencia es ${sent.createdTimestamp - interaction.createdTimestamp}ms. La latencia de la API es ${Math.round(interaction.client.ws.ping)}ms`);
    },
  };
  