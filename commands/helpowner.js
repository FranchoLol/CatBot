const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const ownerCommands = [
  { name: 'totalashemojis', description: 'Muestra una lista de todos los emojis en todos los servidores' },
  { name: 'totalashgif', description: 'Muestra una lista de todos los GIFs en todos los servidores' },
  { name: 'servers', description: 'Lista los servidores en los que está el bot con la fecha de unión y antigüedad' },
];

module.exports = {
  name: 'helpowner',
  description: 'Muestra la lista de comandos disponibles para el propietario del bot',
  usage: 'c!helpowner',
  run: async (client, message, args) => {
    if (message.author.id !== '561667004755345447') {
      return message.reply('Este comando solo puede ser utilizado por el propietario del bot.');
    }

    const embed = createHelpEmbed();
    await message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('helpowner')
    .setDescription('Muestra la lista de comandos disponibles para el propietario del bot'),
  async execute(interaction) {
    if (interaction.user.id !== '561667004755345447') {
      return interaction.reply({ content: 'Este comando solo puede ser utilizado por el propietario del bot.', ephemeral: true });
    }

    const embed = createHelpEmbed();
    await interaction.reply({ embeds: [embed] });
  },
};

function createHelpEmbed() {
  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('Comandos del Propietario')
    .setDescription('Lista de comandos disponibles solo para el propietario del bot:')
    .addFields(
      ownerCommands.map(cmd => ({ name: cmd.name, value: cmd.description }))
    )
    .setFooter({ text: 'Estos comandos solo pueden ser utilizados por el propietario del bot.' })
    .setTimestamp();

  return embed;
}

