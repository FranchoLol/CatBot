const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'google',
  description: 'Busca en Google',
  usage: 'k!google <búsqueda>',
  run: async (client, message, args) => {
    if (!args.length) return message.reply('Por favor, proporciona un término de búsqueda.');

    const query = args.join(' ');
    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;

    try {
      const response = await axios.get(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`);
      const results = response.data.items.slice(0, 5);

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Resultados de búsqueda para: ${query}`)
        .setDescription(results.map((item, index) => `${index + 1}. [${item.title}](${item.link})`).join('\n'));

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('Hubo un error al realizar la búsqueda.');
    }
  },
  data: {
    name: 'google',
    description: 'Busca en Google',
    options: [
      {
        name: 'query',
        type: 3, // STRING type
        description: 'Término de búsqueda',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const query = interaction.options.getString('query');
    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;

    try {
      const response = await axios.get(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`);
      const results = response.data.items.slice(0, 5);

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Resultados de búsqueda para: ${query}`)
        .setDescription(results.map((item, index) => `${index + 1}. [${item.title}](${item.link})`).join('\n'));

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Hubo un error al realizar la búsqueda.', ephemeral: true });
    }
  },
};
