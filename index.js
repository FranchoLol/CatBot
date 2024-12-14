import 'dotenv/config';
import { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  ActivityType, 
  Collection, 
  PresenceUpdateStatus,
  EmbedBuilder
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

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
const commandFolders = fs.readdirSync(commandsPath);
for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = await import(filePath);
    if ('data' in command && 'execute' in command.default) {
      client.slashCommands.set(command.default.data.name, command.default);
    }
    if ('name' in command.default && 'run' in command.default) {
      client.commands.set(command.default.name, command.default);
    }
  }
}


// Función para contar usuarios en todos los servidores
function getTotalUsers() {
  return client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
}

client.once('ready', () => {
  console.log(chalk.magenta(`Bot conectado: ${client.user.tag}!`));

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
  try {
    if (!message.guild || message.author.bot) return;

    const { addMessageExperience, getLevelChannelConfig } = await import('./utils/experienceUtils');
    
    const prefix = getPrefix(message.guild.id);
    const mentionRegex = new RegExp(`^<@!?${client.user.id}>( |)$`);

    if (mentionRegex.test(message.content)) {
      const mentionCommand = await import('./commands/bot/mention');
      mentionCommand.default.execute(message, prefix);
      return;
    }

    // Verificar si el mensaje es un comando antes de añadir XP
    if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) {
      // Add XP for sending a message (solo si no es un comando)
      const result = addMessageExperience(message.guild.id, message.author.id, message.content.length, message.channel.id);

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
            customMessage = customMessage.replace(/\[gif:(\d+)\]/g, (match, id) => {
              const gif = message.guild.emojis.cache.get(id);
              return gif ? `<a:${gif.name}:${id}>` : match;
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
    }

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
  } catch (error) {
    console.error('Error processing message:', error);
    // Optionally, you can send an error message to a logging channel
    // const logChannel = client.channels.cache.get('YOUR_LOG_CHANNEL_ID');
    // if (logChannel) {
    //   logChannel.send(`Error processing message: ${error.message}`);
    // }
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

