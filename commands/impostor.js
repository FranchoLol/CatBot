const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'impostor',
  description: 'Muestra si un usuario es un impostor',
  usage: 'c!impostor [@usuario]',
  run: async (client, message, args) => {
    const target = message.mentions.users.first() || message.author;
    const isImpostor = Math.random() < 0.5;

    const embed = createImpostorEmbed(target, isImpostor);
    message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('impostor')
    .setDescription('Muestra si un usuario es un impostor')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario a investigar')
        .setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('usuario') || interaction.user;
    const isImpostor = Math.random() < 0.5;

    const embed = createImpostorEmbed(target, isImpostor);
    interaction.reply({ embeds: [embed] });
  },
};

function createImpostorEmbed(user, isImpostor) {
  const color = isImpostor ? '#FF0000' : '#00FF00';
  const result = isImpostor ? 'Era Un Impostor.' : 'No Era Un Impostor.';
  const remaining = isImpostor ? '0 Impostores Restantes' : '1 Impostor Restante';

  return new EmbedBuilder()
    .setColor(color)
    .setTitle('Among Us')
    .setDescription(`
. 　　　。　　　　•　 　ﾟ　　。 　　.

　　　.　　　 　　.　　　　　。　　 。　. 　

.　　 。　　　　　 ඞ 。 . 　　 • 　　　　•

　　ﾟ　　 ${user} ${result}　 。　.

　　'　　${remaining} 　 。

　　ﾟ　　　.　　　. ,　　　　.　 .
    `)
    .setFooter({ text: 'Cuidado con los impostores!' });
}

