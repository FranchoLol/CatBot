require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  ActivityType, 
  Collection, 
  PresenceUpdateStatus,
  EmbedBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates, // Add this intent for voice support
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.slashCommands = new Collection();
client.config = {
  defaultPrefix: 'c!', // Prefijo predeterminado
};

// Función para obtener prefijos dinámicos
function getPrefix(guildId) {
  const prefixesPath = path.join(__dirname, 'data', 'prefixes.json');

  if (!fs.existsSync(prefixesPath)) {
    return client.config.defaultPrefix;
  }

  const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
  return prefixes[guildId] || client.config.defaultPrefix;
}

// Función para obtener el idioma del servidor
function getLanguage(guildId) {
  const languagesPath = path.join(__dirname, 'data', 'languages.json');

  if (!fs.existsSync(languagesPath)) {
    return 'es'; // Idioma predeterminado: español
  }

  const languages = JSON.parse(fs.readFileSync(languagesPath, 'utf8'));
  return languages[guildId] || 'es';
}

// Cargar comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.slashCommands.set(command.data.name, command);
  }
  if ('name' in command && 'run' in command) {
    client.commands.set(command.name, command);
  }
}

// Función para contar usuarios en todos los servidores
function getTotalUsers() {
  return client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
}

client.once('ready', () => {
  console.log(`Bot conectado: ${client.user.tag}!`);

  client.user.setStatus(PresenceUpdateStatus.DoNotDisturb);

  let activityIndex = 0; // Para rotar las actividades

  setInterval(() => {
    const totalServers = client.guilds.cache.size * 5;
    const totalUsers = getTotalUsers() * 5;

    const activities = [
      { type: ActivityType.Playing, name: `Prefijo: ${client.config.defaultPrefix}` },
      { type: ActivityType.Watching, name: `${totalServers} servidores` },
      { type: ActivityType.Listening, name: `${totalUsers} usuarios` },
    ];

    // Alternar entre las actividades
    const activity = activities[activityIndex];
    client.user.setActivity(activity.name, { type: activity.type });

    activityIndex = (activityIndex + 1) % activities.length; // Cambiar al siguiente estado
  }, 10000); // Actualización cada 10 segundos
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  const language = getLanguage(interaction.guildId);

  try {
    await command.execute(interaction, language);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Hubo un error al ejecutar este comando!', ephemeral: true });
  }
});

client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;

  const { addMessageExperience, getLevelChannelConfig } = require('./utils/experienceUtils');
  // Add XP for sending a message
  const result = addMessageExperience(message.guild.id, message.author.id, message.content.length);
  
  // Verificar si el usuario subió de nivel
  if (result.leveledUp) {
    const config = getLevelChannelConfig(message.guild.id);
    const channel = config.channelId ? message.guild.channels.cache.get(config.channelId) : message.channel;
    
    if (channel) {
      const defaultMessage = `¡Felicidades <@${message.author.id}>! Has subido al nivel ${result.level}.`;
      let customMessage;

      if (config.message) {
        customMessage = config.message.text
          .replace('[user]', `<@${message.author.id}>`)
          .replace('[lvl]', result.level.toString());

        // Detectar y reemplazar IDs de emojis/GIFs
        customMessage = customMessage.replace(/\[id:(\d+)\]/g, (match, id) => {
          const emoji = message.guild.emojis.cache.get(id);
          return emoji ? (emoji.animated ? `<a:${emoji.name}:${id}>` : `<:${emoji.name}:${id}>`) : match;
        });

        // Procesar GIFs en el mensaje
        customMessage = customMessage.replace(/\[gif:([^\]]+)\]/g, (match, url) => {
          return `[GIF](${decodeURIComponent(url)})`;
        });

        if (config.message.showDateTime) {
          const now = new Date();
          customMessage += `\n(${now.toLocaleString()})`;
        }

        if (config.message.type === 'embed') {
          const embed = new EmbedBuilder()
            .setColor(config.message.color)
            .setDescription(customMessage);
          channel.send({ embeds: [embed] });
        } else {
          channel.send(customMessage);
        }
      } else {
        channel.send(defaultMessage);
      }
    }
  }

  const prefix = getPrefix(message.guild.id);
  const language = getLanguage(message.guild.id);

  if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
    return message.reply(getResponse(language, 'commandNotFound', prefix));
  }

  try {
    await command.run(client, message, args, language);
  } catch (error) {
    console.error(error);
    await message.reply(getResponse(language, 'errorExecutingCommand'));
  }
});

client.login(process.env.DISCORD_TOKEN);

function getResponse(lang, key, ...args) {
  const responses = {
    es: {
      commandNotFound: 'No se encontró ese comando. Usa `%shelp` para ver la lista de comandos disponibles.',
      errorExecutingCommand: 'Hubo un error al ejecutar este comando.'
    },
    en: {
      commandNotFound: 'That command was not found. Use `%shelp` to see the list of available commands.',
      errorExecutingCommand: 'There was an error executing this command.'
    },
    pt: {
      commandNotFound: 'Esse comando não foi encontrado. Use `%shelp` para ver a lista de comandos disponíveis.',
      errorExecutingCommand: 'Houve um erro ao executar este comando.'
    }
  };

  let message = responses[lang][key] || responses['en'][key];
  for (let i = 0; i < args.length; i++) {
    message = message.replace('%s', args[i]);
  }
  return message;
}

