const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData, saveUserData, getUnlockedLanguages, updateActiveLanguages, gameConfig } = require('../utils/helpers');

const LANGUAGES_PER_PAGE = 10;

module.exports = {
  name: 'selectdev',
  description: 'Selecciona o muestra los lenguajes de desarrollo activos',
  usage: 'c!selectdev [lenguaje_actual] [nuevo_lenguaje]',
  run: async (client, message, args) => {
    const result = await executeSelectDev(client, message.author.id, args[0], args[1], message);
    if (typeof result === 'string') {
      message.reply(result);
    }
  },
  data: new SlashCommandBuilder()
    .setName('selectdev')
    .setDescription('Selecciona o muestra los lenguajes de desarrollo activos')
    .addStringOption(option =>
      option.setName('lenguaje_actual')
        .setDescription('Lenguaje actual a reemplazar')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('nuevo_lenguaje')
        .setDescription('Nuevo lenguaje a activar')
        .setRequired(false)),
  async execute(interaction) {
    const currentLang = interaction.options.getString('lenguaje_actual');
    const newLang = interaction.options.getString('nuevo_lenguaje');
    await executeSelectDev(interaction.client, interaction.user.id, currentLang, newLang, interaction);
  },
};

async function executeSelectDev(client, userId, currentLang, newLang, interaction) {
  let userData = getUserData(userId);
  const unlockedLanguages = getUnlockedLanguages(userData.level);
  userData = updateActiveLanguages(userData);
  const activeLanguages = userData.activeLanguages;

  if (!currentLang && !newLang) {
    let currentPage = userData.selectDevPage || 0;
    const totalPages = Math.ceil(gameConfig.languages.length / LANGUAGES_PER_PAGE);

    const createEmbed = (page) => {
      const startIndex = page * LANGUAGES_PER_PAGE;
      const endIndex = Math.min((page + 1) * LANGUAGES_PER_PAGE, gameConfig.languages.length);
      const languagesOnPage = gameConfig.languages.slice(startIndex, endIndex);

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Lenguajes de Desarrollo - Seleccionados: ${activeLanguages.join(', ') || '-'}`)
        .setDescription(languagesOnPage.map(lang => {
          const status = activeLanguages.includes(lang.name) ? '✅ Activo' :
                         unlockedLanguages.includes(lang.name) ? '🔓 Desbloqueado' : '🔒 Bloqueado';
          return `${lang.name} - Nivel ${lang.unlockLevel} - ${status}`;
        }).join('\n'))
        .setFooter({ text: `Nivel actual: ${userData.level} | Lenguajes activos: ${activeLanguages.length}/3 | Página ${page + 1} de ${totalPages}` });

      return embed;
    };

    const createButtons = (page) => {
      const row = new ActionRowBuilder();
      if (page > 0) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId('selectdev_prev')
            .setLabel('Anterior')
            .setStyle(ButtonStyle.Primary)
        );
      }
      if (page < totalPages - 1) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId('selectdev_next')
            .setLabel('Siguiente')
            .setStyle(ButtonStyle.Primary)
        );
      }
      return row;
    };

    const embed = createEmbed(currentPage);
    const row = createButtons(currentPage);

    const reply = interaction.replied ? await interaction.editReply({ embeds: [embed], components: [row] }) : await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id === userId) {
        if (i.customId === 'selectdev_next') {
          currentPage = Math.min(currentPage + 1, totalPages - 1);
        } else if (i.customId === 'selectdev_prev') {
          currentPage = Math.max(0, currentPage - 1);
        }
        userData.selectDevPage = currentPage;
        saveUserData({ [userId]: userData });

        const newEmbed = createEmbed(currentPage);
        const newRow = createButtons(currentPage);
        await i.update({ embeds: [newEmbed], components: [newRow] });
      } else {
        await i.reply({ content: 'No puedes usar estos botones.', ephemeral: true });
      }
    });

    collector.on('end', async () => {
      if (interaction.replied) {
        await interaction.editReply({ components: [] });
      }
    });

    return;
  }

  if (currentLang && newLang) {
    if (!activeLanguages.includes(currentLang)) {
      return `El lenguaje ${currentLang} no está activo actualmente.`;
    }

    if (!unlockedLanguages.includes(newLang)) {
      const langConfig = gameConfig.languages.find(l => l.name === newLang);
      return `El lenguaje ${newLang} aún no está desbloqueado. Se desbloquea en el nivel ${langConfig.unlockLevel}.`;
    }

    if (activeLanguages.includes(newLang)) {
      return `El lenguaje ${newLang} ya está activo.`;
    }

    const index = activeLanguages.indexOf(currentLang);
    activeLanguages[index] = newLang;

    userData.activeLanguages = activeLanguages;
    saveUserData({ [userId]: userData });

    return `Has cambiado ${currentLang} por ${newLang} como lenguaje activo.`;
  }

  return 'Uso incorrecto del comando. Usa `c!selectdev` para ver los lenguajes o `c!selectdev [lenguaje_actual] [nuevo_lenguaje]` para cambiar.';
}

