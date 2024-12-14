const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'servers',
  description: 'Lista los servidores en los que está el bot con la fecha de unión y antigüedad.',
  usage: 'c!servers',
  run: async (client, message, args) => {
    if (message.author.id !== '561667004755345447') {
      return message.reply('Este comando solo puede ser utilizado por el propietario del bot.');
    }

    const guildsInfo = getGuildsInfo(client);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📜 Lista de Servidores')
      .setDescription(guildsInfo || 'No estoy en ningún servidor.')
      .setFooter({ text: `Total: ${client.guilds.cache.size} servidores.` });

    await message.channel.send({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('servers')
    .setDescription('Lista los servidores en los que está el bot con la fecha de unión y antigüedad.'),
  async execute(interaction) {
    if (interaction.user.id !== '561667004755345447') {
      return interaction.reply({ content: 'Este comando solo puede ser utilizado por el propietario del bot.', ephemeral: true });
    }

    const guildsInfo = getGuildsInfo(interaction.client);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📜 Lista de Servidores')
      .setDescription(guildsInfo || 'No estoy en ningún servidor.')
      .setFooter({ text: `Total: ${interaction.client.guilds.cache.size} servidores.` });

    await interaction.reply({ embeds: [embed] });
  },
};

function getGuildsInfo(client) {
  const now = new Date();

  // Ordenar servidores por fecha de unión (antiguo a nuevo)
  const sortedGuilds = client.guilds.cache.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);

  // Crear la lista con el formato solicitado
  return sortedGuilds.map(guild => {
    const joinedDate = new Date(guild.joinedAt);
    const { years, months } = calculateTimeDifference(joinedDate, now);
    const formattedDate = `${joinedDate.getDate()}/${joinedDate.getMonth() + 1}/${joinedDate.getFullYear()}`;
    const inviteLink = `https://discord.gg/${guild.vanityURLCode || 'invite'}`;
    return `[**${guild.name}**](${inviteLink}) - ${years} años, ${months} meses (${formattedDate})`;
  }).join('\n');
}

function calculateTimeDifference(startDate, endDate) {
  const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return { years, months };
}

