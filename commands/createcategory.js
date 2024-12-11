const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'createcategory',
  description: 'Crea una nueva categoría',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('No tienes permiso para crear categorías.');
    }

    const name = args.join(' ');
    if (!name) {
      return message.reply('Por favor, proporciona un nombre para la categoría.');
    }

    try {
      const category = await message.guild.channels.create({
        name: name,
        type: 4, // GUILD_CATEGORY
        reason: 'Categoría creada por comando',
      });
      message.reply(`Categoría "${category.name}" creada exitosamente.`);
    } catch (error) {
      console.error(error);
      message.reply('Hubo un error al crear la categoría.');
    }
  },
  data: {
    name: 'createcategory',
    description: 'Crea una nueva categoría',
    options: [
      {
        name: 'nombre',
        type: 3, // STRING type
        description: 'El nombre de la nueva categoría',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: 'No tienes permiso para crear categorías.', ephemeral: true });
    }

    const name = interaction.options.getString('nombre');

    try {
      const category = await interaction.guild.channels.create({
        name: name,
        type: 4, // GUILD_CATEGORY
        reason: 'Categoría creada por comando de barra',
      });
      interaction.reply(`Categoría "${category.name}" creada exitosamente.`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Hubo un error al crear la categoría.', ephemeral: true });
    }
  },
};

