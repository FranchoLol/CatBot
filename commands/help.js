const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const categories = [
  {
    name: '🛠️ Moderación',
    commands: ['kick', 'ban', 'banip', 'unban', 'unbanip', 'mute', 'unmute', 'mutes', 'clear', 'warn', 'warns', 'delwarn', 'slowmode', 'lock', 'unlock']
  },
  {
    name: 'ℹ️ Información',
    commands: ['userinfo', 'serverinfo', 'botinfo', 'roleinfo', 'id', 'bans']
  },
  {
    name: '🎭 Utilidad',
    commands: ['say', 'embed', 'ping', 'avatar', 'jumbo', 'calc', 'invite', 'support', 'emoji', 'gif']
  },
  {
    name: '⚙️ Configuración',
    commands: ['setprefix', 'setlanguage', 'delprefix', 'autoroleadd', 'autoroleremove', 'autorolelist']
  },
  {
    name: '🔍 Búsqueda',
    commands: ['google']
  },
  {
    name: '😄 Diversión',
    commands: ['8ball', 'rps', 'love', 'covid', 'impostor', 'intelligence']
  },
  {
    name: '🏆 Niveles',
    commands: ['level', 'top', 'leveladd', 'levelremove', 'levelchannel', 'levelchannelremove', 'levelchannelset', 'levelmessage', 'levelmessageremove', 'levellimitchannel', 'levelrestorechannel', 'levelrestoreall', 'levellimitrole', 'levelrestorerol', 'levelrestoreallroles', 'levelconfig']
  },
  {
    name: '🎉 Eventos',
    commands: ['giveaway']
  },
  {
    name: '👋 Bienvenida y Despedida',
    commands: ['welcomechannel', 'welcomemessage', 'goodbyechannel', 'goodbyemessage', 'greetingsettings']
  },
  {
    name: '🤖 Bot',
    commands: ['help', 'donate', 'kinshipdev']
  },
];

module.exports = {
  name: 'help',
  description: 'Muestra la lista de comandos disponibles',
  usage: 'k!help [comando]',
  run: async (client, message, args) => {
    const prefix = client.config.prefix;

    if (args[0]) {
      const commandName = args[0].toLowerCase();
      const command = client.commands.get(commandName);
      if (!command) {
        return message.reply('No se encontró ese comando.');
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Comando: ${command.name}`)
        .addFields(
          { name: 'Descripción', value: command.description },
          { name: 'Uso', value: `\`${command.usage || `${prefix}${command.name}`}\`` }
        );

      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Comandos Disponibles')
      .setDescription(`Usa \`${prefix}help [comando]\` para obtener más información sobre un comando específico.`);

    categories.forEach(category => {
      embed.addFields({
        name: category.name,
        value: category.commands.map(cmd => `\`${cmd}\``).join(', ')
      });
    });

    embed.setFooter({ text: `Total de comandos: ${client.commands.size}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra la lista de comandos disponibles')
    .addStringOption(option =>
      option.setName('comando')
        .setDescription('Nombre del comando para obtener información detallada')
        .setRequired(false)),
  async execute(interaction) {
    const prefix = interaction.client.config.prefix;
    const commandName = interaction.options.getString('comando');

    if (commandName) {
      const command = interaction.client.commands.get(commandName.toLowerCase());
      if (!command) {
        return interaction.reply({ content: 'No se encontró ese comando.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Comando: ${command.name}`)
        .addFields(
          { name: 'Descripción', value: command.description },
          { name: 'Uso', value: `\`${command.usage || `${prefix}${command.name}`}\`` }
        );

      return interaction.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Comandos Disponibles')
      .setDescription(`Usa \`/help comando:[nombre del comando]\` para obtener más información sobre un comando específico.`);

    categories.forEach(category => {
      embed.addFields({
        name: category.name,
        value: category.commands.map(cmd => `\`${cmd}\``).join(', ')
      });
    });

    embed.setFooter({ text: `Total de comandos: ${interaction.client.commands.size}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

