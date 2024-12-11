const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'id',
  description: 'Muestra el ID de un usuario, canal, rol o emoji',
  usage: 'k!id <@mención|nombre|emoji>',
  run: async (client, message, args) => {
    if (!args[0]) {
      return message.reply('Por favor, menciona un usuario, canal, rol o proporciona un emoji.');
    }

    let target = args[0];
    let id, name, type;

    if (message.mentions.users.size > 0) {
      const user = message.mentions.users.first();
      id = user.id;
      name = user.tag;
      type = 'Usuario';
    } else if (message.mentions.channels.size > 0) {
      const channel = message.mentions.channels.first();
      id = channel.id;
      name = channel.name;
      type = 'Canal';
    } else if (message.mentions.roles.size > 0) {
      const role = message.mentions.roles.first();
      id = role.id;
      name = role.name;
      type = 'Rol';
    } else if (target.match(/<a?:.+:\d+>/)) {
      const match = target.match(/<a?:.+:(\d+)>/);
      id = match[1];
      name = target;
      type = 'Emoji personalizado';
    } else {
      return message.reply('No se pudo encontrar el objetivo especificado.');
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`ID de ${type}`)
      .addFields(
        { name: 'Nombre', value: name },
        { name: 'ID', value: id }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
  data: {
    name: 'id',
    description: 'Muestra el ID de un usuario, canal, rol o emoji',
    options: [
      {
        name: 'objetivo',
        type: 3, // STRING type
        description: 'El usuario, canal, rol o emoji del que quieres obtener el ID',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const target = interaction.options.getString('objetivo');
    let id, name, type;

    if (interaction.options.getUser('objetivo')) {
      const user = interaction.options.getUser('objetivo');
      id = user.id;
      name = user.tag;
      type = 'Usuario';
    } else if (interaction.options.getChannel('objetivo')) {
      const channel = interaction.options.getChannel('objetivo');
      id = channel.id;
      name = channel.name;
      type = 'Canal';
    } else if (interaction.options.getRole('objetivo')) {
      const role = interaction.options.getRole('objetivo');
      id = role.id;
      name = role.name;
      type = 'Rol';
    } else if (target.match(/<a?:.+:\d+>/)) {
      const match = target.match(/<a?:.+:(\d+)>/);
      id = match[1];
      name = target;
      type = 'Emoji personalizado';
    } else {
      return interaction.reply({ content: 'No se pudo encontrar el objetivo especificado.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`ID de ${type}`)
      .addFields(
        { name: 'Nombre', value: name },
        { name: 'ID', value: id }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

