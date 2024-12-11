const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Elimina una cantidad específica de mensajes en el canal',
  usage: 'k!clear <cantidad>',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('No tienes permiso para eliminar mensajes.');
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('Por favor, proporciona un número válido entre 1 y 100.');
    }

    try {
      const deleted = await message.channel.bulkDelete(amount, true);
      message.channel.send(`Se han eliminado ${deleted.size} mensajes.`).then(msg => {
        setTimeout(() => msg.delete(), 5000);
      });
    } catch (error) {
      console.error(error);
      message.reply('Hubo un error al intentar eliminar los mensajes.');
    }
  },
  data: {
    name: 'clear',
    description: 'Elimina una cantidad específica de mensajes en el canal',
    options: [
      {
        name: 'cantidad',
        type: 4, // INTEGER type
        description: 'La cantidad de mensajes a eliminar (1-100)',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: 'No tienes permiso para eliminar mensajes.', ephemeral: true });
    }

    const amount = interaction.options.getInteger('cantidad');
    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: 'Por favor, proporciona un número válido entre 1 y 100.', ephemeral: true });
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      interaction.reply({ content: `Se han eliminado ${deleted.size} mensajes.`, ephemeral: true });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Hubo un error al intentar eliminar los mensajes.', ephemeral: true });
    }
  },
};
