const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'donate',
  description: 'Muestra información sobre cómo donar al bot',
  usage: 'k!donate',
  run: async (client, message, args, lang) => {
    const embed = createDonationEmbed(lang);
    await message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('donate')
    .setDescription('Muestra información sobre cómo donar al bot'),
  async execute(interaction, lang) {
    const embed = createDonationEmbed(lang);
    await interaction.reply({ embeds: [embed] });
  },
};

function createDonationEmbed(lang) {
  return new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(getResponse(lang, 'title'))
    .setDescription(getResponse(lang, 'description'))
    .addFields(
      { name: getResponse(lang, 'paypalField'), value: '[PayPal](https://paypal.me/yourusername)' },
      { name: getResponse(lang, 'patreonField'), value: '[Patreon](https://www.patreon.com/yourusername)' },
      { name: getResponse(lang, 'kofiField'), value: '[Ko-fi](https://ko-fi.com/yourusername)' }
    )
    .setFooter({ text: getResponse(lang, 'footer') })
    .setTimestamp();
}

function getResponse(lang, key) {
  const responses = {
    es: {
      title: '💖 Apoya el desarrollo del bot',
      description: 'Si te gusta este bot y quieres apoyar su desarrollo, considera hacer una donación. ¡Cada contribución ayuda a mantener el bot en funcionamiento y a agregar nuevas características!',
      paypalField: 'Donar con PayPal',
      patreonField: 'Apoyar en Patreon',
      kofiField: 'Invítame a un café en Ko-fi',
      footer: '¡Gracias por tu apoyo!'
    },
    en: {
      title: '💖 Support Bot Development',
      description: 'If you like this bot and want to support its development, please consider making a donation. Every contribution helps keep the bot running and add new features!',
      paypalField: 'Donate with PayPal',
      patreonField: 'Support on Patreon',
      kofiField: 'Buy me a coffee on Ko-fi',
      footer: 'Thank you for your support!'
    },
    pt: {
      title: '💖 Apoie o desenvolvimento do bot',
      description: 'Se você gosta deste bot e quer apoiar seu desenvolvimento, considere fazer uma doação. Cada contribuição ajuda a manter o bot funcionando e a adicionar novos recursos!',
      paypalField: 'Doar com PayPal',
      patreonField: 'Apoiar no Patreon',
      kofiField: 'Me pague um café no Ko-fi',
      footer: 'Obrigado pelo seu apoio!'
    }
  };

  return responses[lang][key] || responses['en'][key];
}

