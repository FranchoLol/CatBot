const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserExperience, getXpForNextLevel } = require('../../utils/experienceUtils');

module.exports = {
  name: 'level',
  aliases: ['rank', 'lvl'],
  description: 'Muestra el nivel y experiencia de un usuario',
  usage: 'k!level [@usuario]',
  run: async (client, message, args, lang) => {
    const user = message.mentions.users.first() || message.author;
    const userExp = getUserExperience(message.guild.id, user.id);
    const embed = createLevelEmbed(user, userExp, lang);
    await message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Muestra el nivel y experiencia de un usuario')
    .addUserOption(option => 
      option.setName('usuario')
        .setDescription('El usuario del que quieres ver el nivel')
        .setRequired(false)),
  async execute(interaction, lang) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const userExp = getUserExperience(interaction.guild.id, user.id);
    const embed = createLevelEmbed(user, userExp, lang);
    await interaction.reply({ embeds: [embed] });
  },
};

function createLevelEmbed(user, userExp, lang) {
  const nextLevelXp = getXpForNextLevel(userExp.level);
  const xpNeeded = nextLevelXp - userExp.xp;
  const progressPercentage = (userExp.xp / nextLevelXp) * 100;

  return new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(getResponse(lang, 'levelTitle', user.username))
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: getResponse(lang, 'levelField'), value: userExp.level.toString(), inline: true },
      { name: getResponse(lang, 'xpField'), value: userExp.xp.toString(), inline: true },
      { name: getResponse(lang, 'nextLevelField'), value: `${xpNeeded} XP`, inline: true },
      { name: getResponse(lang, 'progressField'), value: `${progressPercentage.toFixed(2)}%` }
    )
    .setTimestamp();
}

function getResponse(lang, key, ...args) {
  const responses = {
    es: {
      levelTitle: 'Nivel de %s',
      levelField: 'Nivel',
      xpField: 'XP',
      nextLevelField: 'XP para el siguiente nivel',
      progressField: 'Progreso'
    },
    en: {
      levelTitle: '%s\'s Level',
      levelField: 'Level',
      xpField: 'XP',
      nextLevelField: 'XP to next level',
      progressField: 'Progress'
    },
    pt: {
      levelTitle: 'Nível de %s',
      levelField: 'Nível',
      xpField: 'XP',
      nextLevelField: 'XP para o próximo nível',
      progressField: 'Progresso'
    }
  };

  let message = responses[lang][key] || responses['en'][key];
  for (let i = 0; i < args.length; i++) {
    message = message.replace('%s', args[i]);
  }
  return message;
}

