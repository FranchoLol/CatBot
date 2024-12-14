const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'mention',
  description: 'Responde cuando el bot es mencionado',
  execute(message, prefix) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('¡Hola! Soy CatBot 🐈')
      .setDescription(`Mi prefijo en este servidor es \`${prefix}\`. Usa \`${prefix}help\` para ver la lista de comandos disponibles.`)
      .setFooter({ text: 'Desarrollado con ❤️ por KinshipDev' });

    message.reply({ embeds: [embed] });
  },
};

