const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { removeExperience, getUserExperience, setLevel, getXpForNextLevel } = require('../../utils/experienceUtils');

module.exports = {
  name: 'levelremove',
  description: 'Quita experiencia o niveles a un usuario',
  usage: 'k!levelremove <@usuario> <cantidad> [xp|lvl]',
  run: async (client, message, args, lang) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply(getResponse(lang, 'noPermission'));
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply(getResponse(lang, 'noUserMentioned'));

    const amount = parseInt(args[1]);
    if (isNaN(amount)) return message.reply(getResponse(lang, 'invalidAmount'));

    const type = args[2]?.toLowerCase() || 'xp';
    if (type !== 'xp' && type !== 'lvl') return message.reply(getResponse(lang, 'invalidType'));

    const newExp = removeLevelsOrXp(message.guild.id, user.id, amount, type);

    message.reply(getResponse(lang, 'expRemoved', user.username, amount, type, newExp.level, newExp.xp));
  },
  data: new SlashCommandBuilder()
    .setName('levelremove')
    .setDescription('Quita experiencia o niveles a un usuario')
    .addUserOption(option => 
      option.setName('usuario')
        .setDescription('El usuario al que quitar experiencia o niveles')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('cantidad')
        .setDescription('La cantidad de experiencia o niveles a quitar')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('tipo')
        .setDescription('Tipo de sustracción (xp o lvl)')
        .setRequired(false)
        .addChoices(
          { name: 'Experiencia', value: 'xp' },
          { name: 'Nivel', value: 'lvl' }
        )),
  async execute(interaction, lang) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: getResponse(lang, 'noPermission'), ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const amount = interaction.options.getInteger('cantidad');
    const type = interaction.options.getString('tipo') || 'xp';

    const newExp = removeLevelsOrXp(interaction.guild.id, user.id, amount, type);

    interaction.reply(getResponse(lang, 'expRemoved', user.username, amount, type, newExp.level, newExp.xp));
  },
};

function removeLevelsOrXp(guildId, userId, amount, type) {
  const currentExp = getUserExperience(guildId, userId);
  let newXp, newLevel;

  if (type === 'lvl') {
    newLevel = Math.max(0, currentExp.level - amount);
    newXp = currentExp.xp;
    
    // Adjust XP if it exceeds the new level's requirement
    const xpForNewLevel = getXpForNextLevel(newLevel);
    if (newXp >= xpForNewLevel) {
      newXp = xpForNewLevel - 1;
    }
  } else {
    newXp = Math.max(0, currentExp.xp - amount);
    newLevel = currentExp.level;
    
    // Adjust level if XP is not enough for the current level
    while (newLevel > 0 && newXp < getXpForNextLevel(newLevel - 1)) {
      newLevel--;
    }
  }

  return setLevel(guildId, userId, newLevel, newXp);
}

function getResponse(lang, key, ...args) {
  const responses = {
    es: {
      noPermission: 'No tienes permiso para usar este comando.',
      noUserMentioned: 'Debes mencionar a un usuario.',
      invalidAmount: 'La cantidad debe ser un número válido.',
      invalidType: 'El tipo debe ser "xp" o "lvl".',
      expRemoved: 'Se han quitado %s %s a %s. Ahora está en el nivel %s con %s XP.'
    },
    en: {
      noPermission: 'You don\'t have permission to use this command.',
      noUserMentioned: 'You must mention a user.',
      invalidAmount: 'The amount must be a valid number.',
      invalidType: 'The type must be "xp" or "lvl".',
      expRemoved: '%s %s have been removed from %s. They are now level %s with %s XP.'
    },
    pt: {
      noPermission: 'Você não tem permissão para usar este comando.',
      noUserMentioned: 'Você deve mencionar um usuário.',
      invalidAmount: 'A quantidade deve ser um número válido.',
      invalidType: 'O tipo deve ser "xp" ou "lvl".',
      expRemoved: '%s %s foram removidos de %s. Agora está no nível %s com %s XP.'
    }
  };

  let message = responses[lang][key] || responses['en'][key];
  for (let i = 0; i < args.length; i++) {
    message = message.replace('%s', args[i]);
  }
  return message;
}

