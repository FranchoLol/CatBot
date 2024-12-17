const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

const birthdayPath = path.join(__dirname, '..', 'data', 'birthdays.json');

module.exports = {
  name: 'setbirthday',
  description: 'Guarda o cambia tu fecha de cumpleaños',
  usage: 'c!setbirthday <DD/MM>',
  run: async (client, message, args) => {
    const birthday = parseBirthday(args.join('/'));
    if (!birthday) {
      return message.reply('Fecha de cumpleaños inválida. Usa el formato DD/MM.');
    }

    const result = await setBirthday(message.author.id, birthday);
    message.reply(result);
  },
  data: new SlashCommandBuilder()
    .setName('setbirthday')
    .setDescription('Guarda o cambia tu fecha de cumpleaños')
    .addStringOption(option =>
      option.setName('fecha')
        .setDescription('Tu fecha de cumpleaños (DD/MM)')
        .setRequired(true)),
  async execute(interaction) {
    const birthdayString = interaction.options.getString('fecha');
    const birthday = parseBirthday(birthdayString);
    if (!birthday) {
      return interaction.reply({ content: 'Fecha de cumpleaños inválida. Usa el formato DD/MM.', ephemeral: true });
    }

    const result = await setBirthday(interaction.user.id, birthday);
    await interaction.reply(result);
  },
};

function parseBirthday(birthdayString) {
  const [day, month] = birthdayString.split('/');
  if (isNaN(day) || isNaN(month) || day < 1 || day > 31 || month < 1 || month > 12) {
    return null;
  }
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}`;
}

async function setBirthday(userId, newBirthday) {
  try {
    let birthdays = {};
    if (fs.existsSync(birthdayPath)) {
      birthdays = JSON.parse(fs.readFileSync(birthdayPath, 'utf8'));
    }

    // Eliminar el cumpleaños anterior si existe
    for (const date in birthdays) {
      birthdays[date] = birthdays[date].filter(id => id !== userId);
      if (birthdays[date].length === 0) {
        delete birthdays[date];
      }
    }

    // Agregar el nuevo cumpleaños
    if (!birthdays[newBirthday]) {
      birthdays[newBirthday] = [];
    }
    birthdays[newBirthday].push(userId);

    fs.writeFileSync(birthdayPath, JSON.stringify(birthdays, null, 2));
    return `Tu cumpleaños ha sido establecido para el ${newBirthday}.`;
  } catch (error) {
    console.error('Error en setbirthday:', error);
    return 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.';
  }
}

