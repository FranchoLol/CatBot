const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

const colorMap = {
  'rojo': '#FF0000',
  'azul': '#0000FF',
  'verde': '#00FF00',
  'amarillo': '#FFFF00',
  'naranja': '#FFA500',
  'morado': '#800080',
  'rosa': '#FFC0CB',
  'negro': '#000000',
  'blanco': '#FFFFFF',
  'gris': '#808080',
  'red': '#FF0000',
  'blue': '#0000FF',
  'green': '#00FF00',
  'yellow': '#FFFF00',
  'orange': '#FFA500',
  'purple': '#800080',
  'pink': '#FFC0CB',
  'black': '#000000',
  'white': '#FFFFFF',
  'gray': '#808080',
};

module.exports = {
  name: 'createrole',
  description: 'Crea un nuevo rol en el servidor',
  usage: 'k!createrole <nombre> [color]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('No tienes permiso para crear roles.');
    }

    if (args.length < 1) {
      return message.reply('Uso correcto: k!createrole <nombre> [color]');
    }

    const [name, ...colorArgs] = args;
    let color = colorArgs.join(' ').toLowerCase();

    if (color && !color.startsWith('#')) {
      color = colorMap[color] || 'DEFAULT';
    }

    try {
      const role = await message.guild.roles.create({
        name: name,
        color: color,
        reason: 'Rol creado por comando',
      });
      message.reply(`Rol "${role.name}" creado exitosamente con el color ${color}.`);
    } catch (error) {
      console.error(error);
      message.reply('Hubo un error al crear el rol.');
    }
  },
  data: {
    name: 'createrole',
    description: 'Crea un nuevo rol en el servidor',
    options: [
      {
        name: 'nombre',
        type: 3, // STRING type
        description: 'El nombre del nuevo rol',
        required: true,
      },
      {
        name: 'color',
        type: 3, // STRING type
        description: 'El color del rol (en español, inglés o formato hexadecimal)',
        required: false,
      },
    ],
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'No tienes permiso para crear roles.', ephemeral: true });
    }

    const name = interaction.options.getString('nombre');
    let color = interaction.options.getString('color')?.toLowerCase() || 'DEFAULT';

    if (color && !color.startsWith('#')) {
      color = colorMap[color] || color;
    }

    try {
      const role = await interaction.guild.roles.create({
        name: name,
        color: color,
        reason: 'Rol creado por comando de barra',
      });
      interaction.reply(`Rol "${role.name}" creado exitosamente con el color ${color}.`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Hubo un error al crear el rol.', ephemeral: true });
    }
  },
};
