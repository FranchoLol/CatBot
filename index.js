require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  ActivityType, 
  Collection, 
  PresenceUpdateStatus,
  EmbedBuilder,
  WebhookClient
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { handleNavigationButton } = require('./utils/button_handler');
const { getBirthdayChannelConfig, addMessageExperience, getLevelChannelConfig, checkForBirthdays, sendBirthdayMessage } = require('./utils/helpers'); 
const { getAutoroles } = require('./utils/autoroleUtils');
const { setPremium, isPremium, getPremiumServers, getPremiumSettings } = require('./utils/premiumUtils');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages, 
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.slashCommands = new Collection();
client.config = {
  defaultPrefix: 'c!',
};

function getPrefix(guildId) {
  const prefixesPath = path.join(__dirname, 'data', 'prefixes.json');

  if (!fs.existsSync(prefixesPath)) {
    return client.config.defaultPrefix;
  }

  const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
  return prefixes[guildId] || client.config.defaultPrefix;
}

function getLanguage(guildId) {
  const languagesPath = path.join(__dirname, 'data', 'languages.json');

  if (!fs.existsSync(languagesPath)) {
    return 'es';
  }

  const languages = JSON.parse(fs.readFileSync(languagesPath, 'utf8'));
  return languages[guildId] || 'es';
}

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

function getTotalUsers() {
  return client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
}

client.once('ready', async () => {
  (async () => {
    const chalk = (await import('chalk')).default;
  
    console.log(chalk.hex('#ffcc00')('┏' + '━'.repeat(33) + '┓'));
    console.log(chalk.hex('#ffcc00')('┃  ') + chalk.bold.underline('Bot conectado') + chalk.bold(': ') + chalk.hex('#f47fff')(`${client.user.tag}`) + chalk.hex('#ffcc00')('  ┃'));
    console.log(chalk.hex('#ffcc00')('┗' + '━'.repeat(33) + '┛'));
  })();
  

  client.user.setStatus(PresenceUpdateStatus.DoNotDisturb);

  let activityIndex = 0;

  setInterval(() => {
    const totalServers = client.guilds.cache.size * 5;
    const totalUsers = getTotalUsers() * 5;

    const activities = [
      { type: ActivityType.Playing, name: `Prefijo: ${client.config.defaultPrefix}` },
      { type: ActivityType.Watching, name: `${totalServers} servidores` },
      { type: ActivityType.Listening, name: `${totalUsers} usuarios` },
    ];

    const activity = activities[activityIndex];
    client.user.setActivity(activity.name, { type: activity.type });

    activityIndex = (activityIndex + 1) % activities.length;
  }, 10000);

  // Check premium status for all guilds
  for (const guild of client.guilds.cache.values()) {
    await updateBotPresenceForGuild(guild);
  }

  setInterval(async () => {
    await checkBirthdays(client);
  }, 60000); 
});

async function checkBirthdays(client) {
  await checkForBirthdays(client);
}

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    const [action, command] = interaction.customId.split('_');
    if (action === 'nav') {
      const commandModule = client.commands.get(command);
      if (commandModule && commandModule.execute) {
        await commandModule.execute(interaction);
      }
    } else {
      console.log('Botón presionado:', interaction.customId);
      await handleNavigationButton(interaction);
    }
    return;
  }

  if (interaction.isChatInputCommand()) {
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    const language = getLanguage(interaction.guildId);

    try {
      await command.execute(interaction, language);
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: 'Hubo un error al ejecutar este comando.', 
        ephemeral: true 
      });
    }
  }
});

client.on('messageCreate', async message => {
  try {
    if (!message.guild || message.author.bot) return;

    const prefix = getPrefix(message.guild.id);
    const premiumSettings = await getPremiumSettings(message.guild.id);

    if (premiumSettings && message.mentions.has(client.user)) {
      // Usar webhook para responder si es un servidor premium
      const webhook = await getOrCreateWebhook(message.channel, premiumSettings);
      await webhook.send({
        content: message.content.replace(`<@${client.user.id}>`, ''),
        username: premiumSettings.webhookName,
        avatarURL: premiumSettings.webhookAvatar,
      });
      return;
    }

    if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) {
      const result = addMessageExperience(message.guild.id, message.author.id, message.content.length, message.channel.id);

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

            customMessage = customMessage.replace(/\[id:(\d+)\]/g, (match, id) => {
              const emoji = message.guild.emojis.cache.get(id);
              return emoji ? (emoji.animated ? `<a:${emoji.name}:${id}>` : `<:${emoji.name}:${id}>`) : match;
            });

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
                .setDescription(customMessage)
                .setAuthor({ name: client.user.username, iconURL: await getVirtualAvatarForGuild(message.guild.id) });
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
  }
});

client.on('guildMemberAdd', async (member) => {
  // Código de bienvenida existente
  const config = getConfig();
  const guildConfig = config[member.guild.id];
  
  if (guildConfig && guildConfig.welcomeMessage) {
    const welcomeChannel = member.guild.channels.cache.get(guildConfig.welcomeChannel);
    if (welcomeChannel) {
      const { type, color, title, showTime, content } = guildConfig.welcomeMessage;
      
      if (type === 'embed') {
        const embed = new EmbedBuilder()
          .setColor(color)
          .setTitle(title.replace('[user]', member.user.tag))
          .setDescription(content.replace('[user]', member.toString()).replace('[count]', member.guild.memberCount.toString()));
        
        if (showTime) {
          embed.setTimestamp();
        }
        
        welcomeChannel.send({ embeds: [embed] });
      } else {
        const message = content.replace('[user]', member.toString()).replace('[count]', member.guild.memberCount.toString());
        welcomeChannel.send(message);
      }
    }
  }

  // Nuevo código para autorole
  try {
    const autoroles = await getAutoroles();
    const guildAutoroles = autoroles[member.guild.id];
    
    if (guildAutoroles) {
      const rolesToAdd = member.user.bot ? guildAutoroles.bot : guildAutoroles.user;
      
      if (rolesToAdd && rolesToAdd.length > 0) {
        for (const roleId of rolesToAdd) {
          const role = member.guild.roles.cache.get(roleId);
          if (role) {
            await member.roles.add(role);
            console.log(`Rol ${role.name} añadido a ${member.user.tag} en ${member.guild.name}`);
          } else {
            console.log(`Rol con ID ${roleId} no encontrado en ${member.guild.name}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error al aplicar autoroles:', error);
  }
});

function getConfig() {
  const configPath = path.join(__dirname, 'data', 'welcome_config.json');
  if (!fs.existsSync(configPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

async function updateBotPresenceForGuild(guild) {
  const member = await guild.members.fetch(client.user.id);
  const premiumSettings = await getPremiumSettings(guild.id);

  if (premiumSettings) {
    await member.setNickname(premiumSettings.virtualName);
  } else {
    await member.setNickname('CatBot 🐈');
  }
}

async function getVirtualAvatarForGuild(guildId) {
  const premiumSettings = await getPremiumSettings(guildId);
  return premiumSettings ? premiumSettings.virtualAvatar : client.user.displayAvatarURL();
}

client.on('guildCreate', async (guild) => {
  await updateBotPresenceForGuild(guild);
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

async function getOrCreateWebhook(channel, premiumSettings) {
  const webhooks = await channel.fetchWebhooks();
  let webhook = webhooks.find(wh => wh.owner.id === client.user.id);

  if (!webhook) {
    webhook = await channel.createWebhook({
      name: premiumSettings.webhookName,
      avatar: premiumSettings.webhookAvatar,
    });
  }

  return webhook;
}

