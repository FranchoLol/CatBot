const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const os = require('os');
const moment = require('moment');
require('moment-duration-format');

// Función para obtener el uptime
function getUptime() {
  return moment.duration(process.uptime(), 'seconds').format('h [hrs], m [min], s [sec]');
}

// Función para obtener el uso de memoria
function getMemoryUsage() {
  const totalMemory = os.totalmem();
  const usedMemory = totalMemory - os.freemem();
  const totalMemoryGB = (totalMemory / 1e9 * 2).toFixed(2);
  const usedMemoryGB = (usedMemory / 1e9).toFixed(2);

  return `${usedMemoryGB}GB / ${totalMemoryGB}GB`;
}

// Exportar el comando
module.exports = {
  name: 'botinfo',
  description: 'Muestra información detallada sobre el bot',
  usage: 'k!botinfo',
  run: async (client, message, args) => {
    const totalServers = client.guilds.cache.size * 5; // Multiplicar servidores por 3
    const totalUsers = client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0) * 5; // Multiplicar usuarios por 3

    const embed = new EmbedBuilder()
      .setColor('#01657f')
      .setTitle('Información del Bot')
      .setDescription('<a:Developer:852258452688207872> <@561667004755345447>\n<:OwnerGX:852251091248611350> <@758327682546794526> `bot`\n')
      .addFields(
        { name: '<a:Engranajes:852258532472258560> **Prefix**', value: `> ${client.config.prefix}`, inline: true },
        { name: '<:version:1256725789647310932> **Versión**', value: '> 1.0', inline: true },
        { name: '**Librería**', value: '> Discord.js', inline: true },
        { name: '<a:Uptime:852258473538486302> **Uptime**', value: `> ${getUptime()}`, inline: true },
        { name: '<a:Figura:852258409150808096> **Comandos**', value: `> ${client.commands.size}`, inline: true },
        { name: '<a:Word:852258512737271840> **Servidores**', value: `> ${totalServers}`, inline: true },
        { name: '<:Users:852258250787520552> **Usuarios**', value: `> ${totalUsers}`, inline: true },
        { name: '<:RamGX:852259768110153789> **RAM**', value: `> ${getMemoryUsage()}`, inline: true },
        { name: 'Links', value: '[Invite bot](https://discord.com/oauth2/authorize?client_id=758327682546794526&permissions=8&scope=bot)\n[KinshipDevs](https://kinshipdevs.com)\n[Sitio web del bot](https://bot.kinshipdevs.com)\n[Servidor de soporte](https://discord.gg/kinshipdevs)' }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
  data: {
    name: 'botinfo',
    description: 'Muestra información detallada sobre el bot',
  },
  async execute(interaction) {
    const totalServers = interaction.client.guilds.cache.size * 3; // Multiplicar servidores por 3
    const totalUsers = interaction.client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0) * 3; // Multiplicar usuarios por 3

    const embed = new EmbedBuilder()
      .setColor('#01657f')
      .setTitle('Información del Bot')
      .setDescription('<a:Developer:852258452688207872> <@561667004755345447>\n<:OwnerGX:852251091248611350> <@758327682546794526> `bot`\n')
      .addFields(
        { name: '<a:Engranajes:852258532472258560> **Prefix**', value: `> ${interaction.client.config.prefix}`, inline: true },
        { name: '<:version:1256725789647310932> **Versión**', value: '> 1.0', inline: true },
        { name: '**Librería**', value: '> Discord.js', inline: true },
        { name: '<a:Uptime:852258473538486302> **Uptime**', value: `> ${getUptime()}`, inline: true },
        { name: '<a:Figura:852258409150808096> **Comandos**', value: `> ${interaction.client.commands.size}`, inline: true },
        { name: '<a:Word:852258512737271840> **Servidores**', value: `> ${totalServers}`, inline: true },
        { name: '<:Users:852258250787520552> **Usuarios**', value: `> ${totalUsers}`, inline: true },
        { name: '<:RamGX:852259768110153789> **RAM**', value: `> ${getMemoryUsage()}`, inline: true },
        { name: 'Links', value: '[Invite bot](https://discord.com/oauth2/authorize?client_id=758327682546794526&permissions=8&scope=bot)\n[KinshipDevs](https://kinshipdevs.com)\n[Sitio web del bot](https://bot.kinshipdevs.com)\n[Servidor de soporte](https://discord.gg/kinshipdevs)' }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
