const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'kinshipdev',
  description: 'Muestra información sobre KinshipDev',
  usage: 'k!kinshipdev',
  run: async (client, message, args, lang) => {
    const embed = createKinshipDevEmbed(lang);
    await message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('kinshipdev')
    .setDescription('Muestra información sobre KinshipDev'),
  async execute(interaction, lang) {
    const embed = createKinshipDevEmbed(lang);
    await interaction.reply({ embeds: [embed] });
  },
};

function createKinshipDevEmbed(lang) {
  return new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('KinshipDev')
    .setDescription(getResponse(lang, 'description'))
    .addFields(
      { name: getResponse(lang, 'websiteField'), value: '[KinshipDev.com](https://kinshipdev.com)' },
      { name: getResponse(lang, 'discordField'), value: '[Discord](https://discord.gg/kinshipdevs)' },
      { name: getResponse(lang, 'githubField'), value: '[GitHub](https://github.com/kinshipdev)' }
    )
    .setFooter({ text: getResponse(lang, 'footer') })
    .setTimestamp();
}

function getResponse(lang, key) {
  const responses = {
    es: {
      description: 'KinshipDev es una comunidad de desarrolladores de todo tipo. Nos enfocamos en compartir conocimientos, colaborar en proyectos y ayudarnos mutuamente a crecer como profesionales en el mundo del desarrollo.',
      websiteField: '🌐 Sitio web',
      discordField: '💬 Servidor de Discord',
      githubField: '🐙 GitHub',
      footer: '¡Únete a nuestra comunidad y crece como desarrollador!'
    },
    en: {
      description: 'KinshipDev is a community of developers of all kinds. We focus on sharing knowledge, collaborating on projects, and helping each other grow as professionals in the world of development.',
      websiteField: '🌐 Website',
      discordField: '💬 Discord Server',
      githubField: '🐙 GitHub',
      footer: 'Join our community and grow as a developer!'
    },
    pt: {
      description: 'KinshipDev é uma comunidade de desenvolvedores de todos os tipos. Nos concentramos em compartilhar conhecimento, colaborar em projetos e ajudar uns aos outros a crescer como profissionais no mundo do desenvolvimento.',
      websiteField: '🌐 Site',
      discordField: '💬 Servidor Discord',
      githubField: '🐙 GitHub',
      footer: 'Junte-se à nossa comunidade e cresça como desenvolvedor!'
    }
  };

  return responses[lang][key] || responses['en'][key];
}

