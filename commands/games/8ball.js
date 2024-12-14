const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: '8ball',
  description: 'Pregunta a la bola 8 mágica',
  usage: 'k!8ball <pregunta>',
  run: async (client, message, args, lang) => {
    if (!args.length) {
      return message.reply(getResponse(lang, 'noQuestion'));
    }

    const question = args.join(' ');
    const answer = getRandomAnswer(lang);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🎱 ' + getResponse(lang, 'title'))
      .addFields(
        { name: getResponse(lang, 'questionField'), value: question },
        { name: getResponse(lang, 'answerField'), value: answer }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Pregunta a la bola 8 mágica')
    .addStringOption(option =>
      option.setName('pregunta')
        .setDescription('La pregunta que quieres hacer')
        .setRequired(true)),
  async execute(interaction, lang) {
    const question = interaction.options.getString('pregunta');
    const answer = getRandomAnswer(lang);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🎱 ' + getResponse(lang, 'title'))
      .addFields(
        { name: getResponse(lang, 'questionField'), value: question },
        { name: getResponse(lang, 'answerField'), value: answer }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

function getRandomAnswer(lang) {
  const answers = {
    es: [
      'Es cierto', 'Es decididamente así', 'Sin duda', 'Sí, definitivamente', 'Puedes confiar en ello',
      'Como yo lo veo, sí', 'Lo más probable', 'Perspectiva buena', 'Sí', 'Las señales apuntan a que sí',
      'Respuesta confusa, vuelve a intentarlo', 'Pregunta de nuevo más tarde', 'Mejor no decirte ahora',
      'No puedo predecirlo ahora', 'Concéntrate y pregunta otra vez', 'No cuentes con ello',
      'Mi respuesta es no', 'Mis fuentes dicen que no', 'Las perspectivas no son buenas', 'Muy dudoso'
    ],
    en: [
      'It is certain', 'It is decidedly so', 'Without a doubt', 'Yes definitely', 'You may rely on it',
      'As I see it, yes', 'Most likely', 'Outlook good', 'Yes', 'Signs point to yes',
      'Reply hazy, try again', 'Ask again later', 'Better not tell you now',
      'Cannot predict now', 'Concentrate and ask again', 'Don\'t count on it',
      'My reply is no', 'My sources say no', 'Outlook not so good', 'Very doubtful'
    ],
    pt: [
      'É certo', 'É decididamente assim', 'Sem dúvida', 'Sim, definitivamente', 'Você pode contar com isso',
      'A meu ver, sim', 'Provavelmente', 'Perspectiva boa', 'Sim', 'Os sinais apontam que sim',
      'Resposta nebulosa, tente novamente', 'Pergunte novamente mais tarde', 'É melhor não te dizer agora',
      'Não posso prever agora', 'Concentre-se e pergunte novamente', 'Não conte com isso',
      'Minha resposta é não', 'Minhas fontes dizem que não', 'Perspectivas não são boas', 'Muito duvidoso'
    ]
  };

  return answers[lang][Math.floor(Math.random() * answers[lang].length)];
}

function getResponse(lang, key) {
  const responses = {
    es: {
      noQuestion: 'Por favor, haz una pregunta a la bola 8 mágica.',
      title: 'Bola 8 Mágica',
      questionField: 'Pregunta',
      answerField: 'Respuesta'
    },
    en: {
      noQuestion: 'Please ask a question to the magic 8 ball.',
      title: 'Magic 8 Ball',
      questionField: 'Question',
      answerField: 'Answer'
    },
    pt: {
      noQuestion: 'Por favor, faça uma pergunta à bola 8 mágica.',
      title: 'Bola 8 Mágica',
      questionField: 'Pergunta',
      answerField: 'Resposta'
    }
  };

  return responses[lang][key] || responses['en'][key];
}

