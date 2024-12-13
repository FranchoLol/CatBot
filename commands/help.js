const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const colorOptions = [
'Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Morado', 'Rosa', 'Negro', 'Blanco', 'Gris',
'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Black', 'White', 'Gray'
];

// Actualizar el array de comandos y sus categorías
const commands = [
{
  category: '🛠️ Moderación',
  commands: [
    { name: 'kick', description: 'Expulsa a un usuario del servidor', adminOnly: true },
    { name: 'ban', description: 'Banea a un usuario del servidor', adminOnly: true },
    { name: 'banip', description: 'Banea la IP de un usuario del servidor', adminOnly: true },
    { name: 'clear', description: 'Elimina una cantidad específica de mensajes', adminOnly: true },
    { name: 'createrole', description: 'Crea un nuevo rol', adminOnly: true },
    { name: 'createchannel', description: 'Crea un nuevo canal', adminOnly: true },
    { name: 'movechannel', description: 'Mueve un canal a una categoría o posición', adminOnly: true },
    { name: 'warn', description: 'Advierte a un usuario', adminOnly: true },
    { name: 'delwarn', description: 'Elimina una advertencia de un usuario', adminOnly: true },
    { name: 'warnconfig', description: 'Configura el sistema de advertencias', adminOnly: true },
  ]
},
{
  category: 'ℹ️ Información',
  commands: [
    { name: 'userinfo', description: 'Muestra información sobre un usuario' },
    { name: 'serverinfo', description: 'Muestra información sobre el servidor' },
    { name: 'botinfo', description: 'Muestra información sobre el bot' },
    { name: 'roleinfo', description: 'Muestra información sobre un rol' },
    { name: 'id', description: 'Muestra el ID de un usuario, canal, rol o emoji' },
    { name: 'bans', description: 'Muestra una lista de los usuarios baneados', adminOnly: true },
    { name: 'warns', description: 'Muestra las advertencias de un usuario', adminOnly: true },
  ]
},
{
  category: '🎭 Utilidad',
  commands: [
    { name: 'say', description: 'Hace que el bot repita un mensaje' },
    { name: 'embed', description: 'Crea un mensaje embed personalizado' },
    { name: 'ping', description: 'Muestra la latencia del bot' },
    { name: 'avatar', description: 'Muestra el avatar de un usuario' },
    { name: 'jumbo', description: 'Muestra una versión ampliada de un emoji' },
    { name: 'calc', description: 'Realiza cálculos matemáticos simples' },
    { name: 'invite', description: 'Muestra el enlace de invitación del bot' },
    { name: 'support', description: 'Muestra información sobre el servidor de soporte' },
    { name: 'assignrole', description: 'Asigna uno o varios roles a un usuario', adminOnly: true },
  ]
},
{
  category: '⚙️ Configuración',
  commands: [
    { name: 'setprefix', description: 'Cambia el prefijo del bot para este servidor', adminOnly: true },
    { name: 'setlanguage', description: 'Cambia el idioma del bot para este servidor', adminOnly: true },
    { name: 'delprefix', description: 'Elimina el prefijo personalizado del servidor', adminOnly: true },
  ]
},
{
  category: '🔍 Búsqueda',
  commands: [
    { name: 'google', description: 'Realiza una búsqueda en Google' },
  ]
},
{
  category: '😄 Diversión',
  commands: [
    { name: '8ball', description: 'Pregunta a la bola 8 mágica' },
  ]
},
{
  category: '🏆 Niveles',
  commands: [
    { name: 'level', description: 'Muestra el nivel y experiencia de un usuario' },
    { name: 'top', description: 'Muestra los usuarios con más nivel en el servidor' },
    { name: 'leveladd', description: 'Añade experiencia o niveles a un usuario', adminOnly: true },
    { name: 'levelremove', description: 'Quita experiencia o niveles a un usuario', adminOnly: true },
    { name: 'levelchannel', description: 'Configura el canal y mensaje para los anuncios de subida de nivel', adminOnly: true },
    { name: 'levelchannelremove', description: 'Elimina la configuración de canal para anuncios de subida de nivel', adminOnly: true },
    { name: 'levelchannelset', description: 'Establece un nuevo canal para los anuncios de subida de nivel', adminOnly: true },
    { name: 'levelmessage', description: 'Configura el mensaje para los anuncios de subida de nivel', adminOnly: true },
    { name: 'levelmessageremove', description: 'Elimina la configuración personalizada de mensajes de nivel', adminOnly: true },
    { name: 'levellimitchannel', description: 'Limita la ganancia de XP en canales específicos', adminOnly: true },
    { name: 'levelrestorechannel', description: 'Restaura la ganancia de XP en canales específicos', adminOnly: true },
    { name: 'levelrestoreall', description: 'Restaura la ganancia de XP en todos los canales', adminOnly: true },
    { name: 'levellimitrole', description: 'Limita la ganancia de XP para roles específicos', adminOnly: true },
    { name: 'levelrestorerol', description: 'Restaura la ganancia de XP para roles específicos', adminOnly: true },
    { name: 'levelrestoreallroles', description: 'Restaura la ganancia de XP para todos los roles', adminOnly: true },
    { name: 'levelconfig', description: 'Configura el sistema de niveles', adminOnly: true },
  ]
},
{
  category: '🤖 Bot',
  commands: [
    { name: 'help', description: 'Muestra la lista de comandos disponibles' },
    { name: 'donate', description: 'Muestra información sobre cómo donar al bot' },
    { name: 'kinshipdev', description: 'Muestra información sobre KinshipDev' },
  ]
},
{
  category: '💰 Economía',
  commands: [
    { name: 'balance', description: 'Muestra tu balance actual' },
    { name: 'daily', description: 'Recibe tu recompensa diaria' },
    { name: 'work', description: 'Trabaja para ganar dinero' },
    { name: 'rob', description: 'Intenta robar a otro usuario' },
    { name: 'deposit', description: 'Deposita dinero en el banco' },
    { name: 'withdraw', description: 'Retira dinero del banco' },
    { name: 'transfer', description: 'Transfiere dinero a otro usuario' },
    { name: 'shop', description: 'Muestra los items disponibles en la tienda' },
    { name: 'buy', description: 'Compra un item de la tienda' },
    { name: 'inventory', description: 'Muestra tu inventario' },
    { name: 'addmoney', description: 'Añade dinero a un usuario (Solo para administradores)', adminOnly: true },
    { name: 'removemoney', description: 'Quita dinero a un usuario (Solo para administradores)', adminOnly: true },
    { name: 'exchange', description: 'Cambia una moneda por otra' },
    { name: 'vieweconomyconfig', description: 'Muestra la configuración actual del sistema de economía', adminOnly: true },
    { name: 'seteconomyconfig', description: 'Modifica la configuración del sistema de economía', adminOnly: true },
    { name: 'addcurrency', description: 'Añade una nueva moneda al sistema de economía', adminOnly: true },
    { name: 'setexchangerate', description: 'Establece la tasa de cambio entre dos monedas', adminOnly: true },
    { name: 'addshopitem', description: 'Añade un nuevo item a la tienda', adminOnly: true }
  ]
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
    const command = commands.flatMap(category => category.commands).find(cmd => cmd.name === commandName);
    if (!command) {
      return message.reply('No se encontró ese comando.');
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Comando: ${command.name}`)
      .addFields(
        { name: 'Descripción', value: command.description },
        { name: 'Uso', value: `\`${prefix}${command.name}\`` }
      );

    if (command.adminOnly) {
      embed.addFields({ name: 'Permisos', value: '👑 Este comando requiere permisos de administrador.' });
    }

    return message.reply({ embeds: [embed] });
  }

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Comandos Disponibles')
    .setDescription(`Usa \`${prefix}help [comando]\` para obtener más información sobre un comando específico.`);

  commands.forEach(category => {
    embed.addFields({
      name: category.category,
      value: category.commands.map(cmd => `${cmd.adminOnly ? '👑 ' : ''}\`${cmd.name}\``).join(', ')
    });
  });

  embed.setFooter({ text: `Total de comandos: ${commands.flatMap(category => category.commands).length}` })
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
        { name: 'Descripción', value: command.description || 'No hay descripción disponible.' },
        { name: 'Uso', value: command.usage ? `\`${prefix}${command.usage}\`` : `\`${prefix}${command.name}\`` }
      );

    if (command.name === 'embed' || command.name === 'createrole') {
      embed.addFields(
        { name: 'Opciones de color', value: 'Puedes usar:\n- Código hexadecimal: #ff0000\n- Nombre del color: ' + colorOptions.join(', ') }
      );
    }

    return interaction.reply({ embeds: [embed] });
  }

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Comandos Disponibles')
    .setDescription(`Usa \`/help comando:[nombre del comando]\` para obtener más información sobre un comando específico.`);

  commands.forEach(category => {
    embed.addFields({
      name: category.category,
      value: category.commands.map(cmd => `${cmd.adminOnly ? '👑 ' : ''}\`${cmd.name}\``).join(', ')
    });
  });

  embed.setFooter({ text: `Total de comandos: ${commands.flatMap(category => category.commands).length}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
},
};

