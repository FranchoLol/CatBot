const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { addExperience, getUserExperience, setLevel } = require('../../utils/experienceUtils');

module.exports = {
  name: 'leveladd',
  description: 'Añade experiencia o niveles a un usuario',
  usage: 'k!leveladd <@usuario> <cantidad> [xp|lvl]',
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

    let newExp;
    if (type === 'lvl') {
      const currentExp = getUserExperience(message.guild.id, user.id);
      newExp = setLevel(message.guild.id, user.id, currentExp.level + amount);
    } else {
      newExp = addExperience(message.guild.id, user.id, amount);
    }

    message.reply(getResponse(lang, 'expAdded', user.username, amount, type, newExp.level, newExp.xp));
  },
  data: new SlashCommandBuilder()
    .setName('leveladd')
    .setDescription('Añade experiencia o niveles a un usuario')
    .addUserOption(option => 
      option.setName('usuario')
        .setDescription('El usuario al que añadir experiencia o niveles')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('cantidad')
        .setDescription('La cantidad de experiencia o niveles a añadir')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('tipo')
        .setDescription('Tipo de adición (xp o lvl)')
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

    let newExp;
    if (type === 'lvl') {
      const currentExp = getUserExperience(interaction.guild.id, user.id);
      newExp = setLevel(interaction.guild.id, user.id, currentExp.level + amount);
    } else {
      newExp = addExperience(interaction.guild.id, user.id, amount);
    }

    interaction.reply(getResponse(lang, 'expAdded', user.username, amount, type, newExp.level, newExp.xp));
  },
};

function getResponse(lang, key, ...args) {
  const responses = {
    es: {
      noPermission: 'No tienes permiso para usar este comando.',
      noUserMentioned: 'Debes mencionar a un usuario.',
      invalidAmount: 'La cantidad debe ser un número válido.',
      invalidType: 'El tipo debe ser "xp" o "lvl".',
      expAdded: 'Se han añadido %s %s a %s. Ahora está en el nivel %s con %s XP.'
    },
    en: {
      noPermission: 'You don\'t have permission to use this command.',
      noUserMentioned: 'You must mention a user.',
      invalidAmount: 'The amount must be a valid number.',
      invalidType: 'The type must be "xp" or "lvl".',
      expAdded: '%s %s have been added to %s. They are now level %s with %s XP.'
    },
    pt: {
      noPermission: 'Você não tem permissão para usar este comando.',
      noUserMentioned: 'Você deve mencionar um usuário.',
      invalidAmount: 'A quantidade deve ser um número válido.',
      invalidType: 'O tipo deve ser "xp" ou "lvl".',
      expAdded: '%s %s foram adicionados a %s. Agora está no nível %s com %s XP.'
    }
  };

  let message = responses[lang][key] || responses['en'][key];
  for (let i = 0; i < args.length; i++) {
    message = message.replace('%s', args[i]);
  }
  return message;
}

