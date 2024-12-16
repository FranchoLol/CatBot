const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'embed',
  description: 'Crea un mensaje embed personalizado',
  run: async (client, message, args) => {
    const [title, description, color] = args.join(' ').split('|').map(arg => arg.trim());

    if (!title || !description) {
      return message.reply('Uso correcto: k!embed Título | Descripción | Color (opcional)');
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color || '#0099ff')
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
  data: {
    name: 'embed',
    description: 'Crea un mensaje embed personalizado',
    options: [
      {
        name: 'titulo',
        type: 3, // STRING type
        description: 'El título del embed',
        required: true,
      },
      {
        name: 'descripcion',
        type: 3, // STRING type
        description: 'La descripción del embed',
        required: true,
      },
      {
        name: 'color',
        type: 3, // STRING type
        description: 'El color del embed (en formato hexadecimal)',
        required: false,
      },
    ],
  },
  async execute(interaction) {
    const title = interaction.options.getString('titulo');
    const description = interaction.options.getString('descripcion');
    const color = interaction.options.getString('color') || '#0099ff';

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

