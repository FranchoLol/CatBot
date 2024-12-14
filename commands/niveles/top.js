const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getTopUsers } = require('../../utils/experienceUtils');

module.exports = {
  name: 'top',
  description: 'Muestra los usuarios con más nivel en el servidor',
  usage: 'k!top [cantidad]',
  run: async (client, message, args, lang) => {
    const limit = parseInt(args[0]) || 10;
    const topUsers = await getTopUsers(message.guild.id, limit);
    const embed = await createTopEmbed(message.guild, topUsers, lang);
    await message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Muestra los usuarios con más nivel en el servidor')
    .addIntegerOption(option => 
      option.setName('cantidad')
        .setDescription('Cantidad de usuarios a mostrar')
        .setRequired(false)),
  async execute(interaction, lang) {
    const limit = interaction.options.getInteger('cantidad') || 10;
    const topUsers = await getTopUsers(interaction.guild.id, limit);
    const embed = await createTopEmbed(interaction.guild, topUsers, lang);
    await interaction.reply({ embeds: [embed] });
  },
};

async function createTopEmbed(guild, topUsers, lang) {
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(getResponse(lang, 'topTitle', guild.name))
    .setTimestamp();

  for (let i = 0; i < topUsers.length; i++) {
    const user = await guild.members.fetch(topUsers[i].userId);
    embed.addFields({
      name: `${i + 1}. ${user.user.username}`,
      value: getResponse(lang, 'userInfo', topUsers[i].level, topUsers[i].xp, user.id)
    });
  }

  return embed;
}

function getResponse(lang, key, ...args) {
  const responses = {
    es: {
      topTitle: 'Top usuarios de %s',
      userInfo: 'Nivel %s - %s XP <@%s>'
    },
    en: {
      topTitle: 'Top users of %s',
      userInfo: 'Level %s - %s XP <@%s>'
    },
    pt: {
      topTitle: 'Top usuários de %s',
      userInfo: 'Nível %s - %s XP <@%s>'
    }
  };

  let message = responses[lang][key] || responses['en'][key];
  for (let i = 0; i < args.length; i++) {
    message = message.replace('%s', args[i]);
  }
  return message;
}

