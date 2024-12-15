const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

function calculate(expression) {
  try {
    // Reemplazar × por * y ÷ por /
    expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
    // Evaluar la expresión
    return eval(expression);
  } catch (error) {
    return 'Error: Expresión inválida';
  }
}

module.exports = {
  name: 'calc',
  description: 'Realiza cálculos matemáticos simples',
  usage: 'k!calc <expresión>',
  run: async (client, message, args) => {
    if (args.length === 0) {
      return message.reply('Por favor, proporciona una expresión matemática para calcular.');
    }

    const expression = args.join(' ');
    const result = calculate(expression);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Calculadora')
      .addFields(
        { name: 'Expresión', value: expression },
        { name: 'Resultado', value: result.toString() }
      )
      .setFooter({ text: 'Usa +, -, *, /, ×, ÷ para operaciones básicas' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
  data: {
    name: 'calc',
    description: 'Realiza cálculos matemáticos simples',
    options: [
      {
        name: 'expresion',
        type: 3, // STRING type
        description: 'La expresión matemática a calcular',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const expression = interaction.options.getString('expresion');
    const result = calculate(expression);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Calculadora')
      .addFields(
        { name: 'Expresión', value: expression },
        { name: 'Resultado', value: result.toString() }
      )
      .setFooter({ text: 'Usa +, -, *, /, ×, ÷ para operaciones básicas' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

