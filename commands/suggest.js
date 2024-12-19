const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { checkCooldown, isValidContent } = require('../utils/reportUtils');

module.exports = {
  name: 'suggest',
  description: 'Sugiere una mejora o nueva característica para el bot',
  usage: 'c!suggest <descripción de la sugerencia>',
  run: async (client, message, args) => {
    const cooldownMinutes = await checkCooldown(message.author.id, 'suggest');
    if (cooldownMinutes > 0) {
      const cooldownEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setDescription(`Por favor, espera \`${cooldownMinutes}\` minutos antes de enviar otra sugerencia.`);
      
      const cooldownMsg = await message.reply({ embeds: [cooldownEmbed] });
      
      const interval = setInterval(() => {
        cooldownMinutes--;
        if (cooldownMinutes <= 0) {
          clearInterval(interval);
          cooldownMsg.delete().catch(console.error);
        } else {
          cooldownEmbed.setDescription(`Por favor, espera \`${cooldownMinutes}\` minutos antes de enviar otra sugerencia.`);
          cooldownMsg.edit({ embeds: [cooldownEmbed] }).catch(console.error);
        }
      }, 60000); // Actualizar cada minuto
      
      return;
    }

    const suggestion = args.join(' ');
    if (!isValidContent(suggestion)) {
      return message.reply('Por favor, proporciona una descripción válida y detallada de tu sugerencia (mínimo 10 caracteres).');
    }

    const suggestionEmbed = createSuggestionEmbed(message, suggestion);

    const suggestionChannel = client.channels.cache.get('1319114611424890951');
    if (suggestionChannel) {
      const sentMessage = await suggestionChannel.send({ embeds: [suggestionEmbed] });
      //await sentMessage.react('✅'); //Removed reaction
      
      if (message.attachments.size > 0) {
        const attachmentEmbed = new EmbedBuilder()
          .setDescription('Archivos adjuntos a la sugerencia:')
          .setColor('#00FF00');
        
        message.attachments.forEach(attachment => {
          attachmentEmbed.addFields({ name: 'Archivo', value: attachment.url });
        });
        
        await suggestionChannel.send({ embeds: [attachmentEmbed] });
      }
      
      const cooldownEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setDescription(`Tu sugerencia ha sido enviada. Por favor, espera \`${4 * 60}\` minutos antes de enviar otra sugerencia.`);
      
      message.reply({ embeds: [cooldownEmbed] });
    } else {
      console.log('Canal de sugerencias no encontrado');
      message.reply('Hubo un problema al enviar tu sugerencia. Por favor, inténtalo de nuevo más tarde.');
    }
  },
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Sugiere una mejora o nueva característica para el bot')
    .addStringOption(option =>
      option.setName('sugerencia')
        .setDescription('Descripción detallada de tu sugerencia')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('archivo')
        .setDescription('Archivo adjunto (opcional)')
        .setRequired(false)),
  async execute(interaction) {
    const cooldownMinutes = await checkCooldown(interaction.user.id, 'suggest');
    if (cooldownMinutes > 0) {
      const cooldownEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setDescription(`Por favor, espera \`${cooldownMinutes}\` minutos antes de enviar otra sugerencia.`);
      
      const cooldownMsg = await interaction.reply({ embeds: [cooldownEmbed], ephemeral: true, fetchReply: true });
      
      const interval = setInterval(() => {
        cooldownMinutes--;
        if (cooldownMinutes <= 0) {
          clearInterval(interval);
          cooldownMsg.delete().catch(console.error);
        } else {
          cooldownEmbed.setDescription(`Por favor, espera \`${cooldownMinutes}\` minutos antes de enviar otra sugerencia.`);
          interaction.editReply({ embeds: [cooldownEmbed] }).catch(console.error);
        }
      }, 60000); // Actualizar cada minuto
      
      return;
    }

    const suggestion = interaction.options.getString('sugerencia');
    if (!isValidContent(suggestion)) {
      return interaction.reply({ content: 'Por favor, proporciona una descripción válida y detallada de tu sugerencia (mínimo 10 caracteres).', ephemeral: true });
    }

    const suggestionEmbed = createSuggestionEmbed(interaction, suggestion);

    const suggestionChannel = interaction.client.channels.cache.get('1319114611424890951');
    if (suggestionChannel) {
      const sentMessage = await suggestionChannel.send({ embeds: [suggestionEmbed] });
      //await sentMessage.react('✅'); //Removed reaction
      
      const attachment = interaction.options.getAttachment('archivo');
      if (attachment) {
        const attachmentEmbed = new EmbedBuilder()
          .setDescription('Archivo adjunto a la sugerencia:')
          .addFields({ name: 'Archivo', value: attachment.url })
          .setColor('#00FF00');
        
        await suggestionChannel.send({ embeds: [attachmentEmbed] });
      }
      
      const cooldownEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setDescription(`Tu sugerencia ha sido enviada. Por favor, espera \`${4 * 60}\` minutos antes de enviar otra sugerencia.`);
      
      interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
    } else {
      console.log('Canal de sugerencias no encontrado');
      interaction.reply({ content: 'Hubo un problema al enviar tu sugerencia. Por favor, inténtalo de nuevo más tarde.', ephemeral: true });
    }
  },
};

function createSuggestionEmbed(context, suggestion) {
  const isInteraction = context.constructor.name === 'CommandInteraction';
  const user = isInteraction ? context.user : context.author;
  const guild = isInteraction ? context.guild : context.guild;

  return new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle(`Sugerencia de ${user}`)
    .setDescription(suggestion)
    .addFields(
      { name: 'Servidor', value: guild ? `[${guild.name}](https://discord.com/channels/${guild.id})` : 'DM', inline: true }
    )
    .setTimestamp()
    .setFooter({ text: new Date().toLocaleString() });
}

