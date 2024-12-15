const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Muestra el avatar de un usuario',
  usage: 'k!avatar [@usuario|ID]',
  run: async (client, message, args) => {
    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null) || message.author;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Avatar de ${user.tag}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
  data: {
    name: 'avatar',
    description: 'Muestra el avatar de un usuario',
    options: [
      {
        name: 'usuario',
        type: 6, // USER type
        description: 'El usuario del que quieres ver el avatar',
        required: false,
      },
    ],
  },
  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Avatar de ${user.tag}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

