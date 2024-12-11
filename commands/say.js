const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'say',
    description: 'Hace que el bot repita tu mensaje',
    run: async (client, message, args) => {
      if (!args.length) {
        return message.reply('¡Necesitas proporcionar un mensaje para que yo lo repita!');
      }
  
      const sayMessage = args.join(' ');
      await message.delete().catch(console.error);
      await message.channel.send(sayMessage);
    },
    data: {
      name: 'say',
      description: 'Hace que el bot diga un mensaje',
      options: [
        {
          name: 'mensaje',
          type: 3, // STRING type
          description: 'El mensaje que quieres que el bot diga',
          required: true,
        },
      ],
    },
    async execute(interaction) {
      const sayMessage = interaction.options.getString('mensaje');
      await interaction.reply({ content: sayMessage, allowedMentions: { parse: [] } });
    },
  };
  