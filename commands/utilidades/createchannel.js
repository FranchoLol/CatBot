const { PermissionFlagsBits, ChannelType } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'createchannel',
  description: 'Crea un nuevo canal en el servidor',
  usage: 'k!createchannel <nombre> <tipo> [categoría] [privado]',
  run: async (client, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('No tienes permiso para crear canales.');
    }

    if (args.length < 2) {
      return message.reply('Uso correcto: k!createchannel <nombre> <tipo> [categoría] [privado]');
    }

    const [name, type, categoryName, isPrivate] = args;
    let channelType;
    switch (type.toLowerCase()) {
      case 'text':
        channelType = ChannelType.GuildText;
        break;
      case 'voice':
        channelType = ChannelType.GuildVoice;
        break;
      case 'category':
        channelType = ChannelType.GuildCategory;
        break;
      case 'news':
        channelType = ChannelType.GuildAnnouncement;
        break;
      case 'stage':
        channelType = ChannelType.GuildStageVoice;
        break;
      case 'forum':
        channelType = ChannelType.GuildForum;
        break;
      default:
        return message.reply('Tipo de canal no válido. Opciones: text, voice, category, news, stage, forum');
    }

    try {
      let category;
      if (categoryName) {
        category = message.guild.channels.cache.find(
          c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === categoryName.toLowerCase()
        );
      }

      const channelOptions = {
        name: name,
        type: channelType,
        parent: category,
        reason: 'Canal creado por comando',
      };

      if (isPrivate && isPrivate.toLowerCase() === 'true') {
        channelOptions.permissionOverwrites = [
          {
            id: message.guild.id,
            deny: ['ViewChannel'],
          },
        ];
      }

      const channel = await message.guild.channels.create(channelOptions);
      message.reply(`Canal "${channel.name}" creado exitosamente${category ? ` en la categoría "${category.name}"` : ''}.`);
    } catch (error) {
      console.error(error);
      message.reply('Hubo un error al crear el canal.');
    }
  },
  data: {
    name: 'createchannel',
    description: 'Crea un nuevo canal en el servidor',
    options: [
      {
        name: 'nombre',
        type: 3, // STRING type
        description: 'El nombre del nuevo canal',
        required: true,
      },
      {
        name: 'tipo',
        type: 3, // STRING type
        description: 'El tipo de canal',
        required: true,
        choices: [
          { name: 'Texto', value: 'text' },
          { name: 'Voz', value: 'voice' },
          { name: 'Categoría', value: 'category' },
          { name: 'Anuncios', value: 'news' },
          { name: 'Escenario', value: 'stage' },
          { name: 'Foro', value: 'forum' },
        ],
      },
      {
        name: 'categoria',
        type: 3, // STRING type
        description: 'El nombre de la categoría donde crear el canal',
        required: false,
      },
      {
        name: 'privado',
        type: 5, // BOOLEAN type
        description: '¿El canal debe ser privado?',
        required: false,
      },
    ],
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: 'No tienes permiso para crear canales.', ephemeral: true });
    }

    const name = interaction.options.getString('nombre');
    const type = interaction.options.getString('tipo');
    const categoryName = interaction.options.getString('categoria');
    const isPrivate = interaction.options.getBoolean('privado');

    let channelType;
    switch (type) {
      case 'text':
        channelType = ChannelType.GuildText;
        break;
      case 'voice':
        channelType = ChannelType.GuildVoice;
        break;
      case 'category':
        channelType = ChannelType.GuildCategory;
        break;
      case 'news':
        channelType = ChannelType.GuildAnnouncement;
        break;
      case 'stage':
        channelType = ChannelType.GuildStageVoice;
        break;
      case 'forum':
        channelType = ChannelType.GuildForum;
        break;
    }

    try {
      let category;
      if (categoryName) {
        category = interaction.guild.channels.cache.find(
          c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === categoryName.toLowerCase()
        );
      }

      const channelOptions = {
        name: name,
        type: channelType,
        parent: category,
        reason: 'Canal creado por comando de barra',
      };

      if (isPrivate) {
        channelOptions.permissionOverwrites = [
          {
            id: interaction.guild.id,
            deny: ['ViewChannel'],
          },
        ];
      }

      const channel = await interaction.guild.channels.create(channelOptions);
      interaction.reply(`Canal "${channel.name}" creado exitosamente${category ? ` en la categoría "${category.name}"` : ''}.`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Hubo un error al crear el canal.', ephemeral: true });
    }
  },
};

