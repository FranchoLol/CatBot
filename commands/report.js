const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { checkCooldown, isValidContent } = require('../utils/reportUtils');

module.exports = {
  name: 'report',
  description: 'Reporta un bug o problema del bot',
  usage: 'c!report <descripción del bug>',
  run: async (client, message, args) => {
    const cooldownMinutes = await checkCooldown(message.author.id, 'report');
    if (cooldownMinutes > 0) {
      return message.reply(`Por favor, espera ${cooldownMinutes} minutos antes de enviar otro reporte.`);
    }

    const bugDescription = args.join(' ');
    if (!isValidContent(bugDescription)) {
      return message.reply('Por favor, proporciona una descripción válida y detallada del bug (mínimo 10 caracteres).');
    }

    const reportEmbed = createReportEmbed(message, bugDescription);

    const reportChannel = client.channels.cache.get('1319114589845323787');
    if (reportChannel) {
      const sentMessage = await reportChannel.send({ embeds: [reportEmbed] });
      await sentMessage.react('✅');
      
      if (message.attachments.size > 0) {
        const attachmentEmbed = new EmbedBuilder()
          .setDescription('Archivos adjuntos al reporte:')
          .setColor('#FF0000');
        
        message.attachments.forEach(attachment => {
          attachmentEmbed.addFields({ name: 'Archivo', value: attachment.url });
        });
        
        await reportChannel.send({ embeds: [attachmentEmbed] });
      }
      
      const cooldownEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setDescription(`Tu reporte ha sido enviado. Por favor, espera \`${4 * 60}\` minutos antes de enviar otro reporte.`);
      
      message.reply({ embeds: [cooldownEmbed] });
    } else {
      console.log('Canal de reportes no encontrado');
      message.reply('Hubo un problema al enviar tu reporte. Por favor, inténtalo de nuevo más tarde.');
    }
  },
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Reporta un bug o problema del bot')
    .addStringOption(option =>
      option.setName('descripcion')
        .setDescription('Descripción detallada del bug')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('archivo')
        .setDescription('Archivo adjunto (opcional)')
        .setRequired(false)),
  async execute(interaction) {
    const cooldownMinutes = await checkCooldown(interaction.user.id, 'report');
    if (cooldownMinutes > 0) {
      return interaction.reply({ content: `Por favor, espera ${cooldownMinutes} minutos antes de enviar otro reporte.`, ephemeral: true });
    }

    const bugDescription = interaction.options.getString('descripcion');
    if (!isValidContent(bugDescription)) {
      return interaction.reply({ content: 'Por favor, proporciona una descripción válida y detallada del bug (mínimo 10 caracteres).', ephemeral: true });
    }

    const reportEmbed = createReportEmbed(interaction, bugDescription);

    const reportChannel = interaction.client.channels.cache.get('1319114589845323787');
    if (reportChannel) {
      const sentMessage = await reportChannel.send({ embeds: [reportEmbed] });
      await sentMessage.react('✅');
      
      const attachment = interaction.options.getAttachment('archivo');
      if (attachment) {
        const attachmentEmbed = new EmbedBuilder()
          .setDescription('Archivo adjunto al reporte:')
          .addFields({ name: 'Archivo', value: attachment.url })
          .setColor('#FF0000');
        
        await reportChannel.send({ embeds: [attachmentEmbed] });
      }
      
      const cooldownEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setDescription(`Tu reporte ha sido enviado. Por favor, espera \`${4 * 60}\` minutos antes de enviar otro reporte.`);
      
      interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
    } else {
      console.log('Canal de reportes no encontrado');
      interaction.reply({ content: 'Hubo un problema al enviar tu reporte. Por favor, inténtalo de nuevo más tarde.', ephemeral: true });
    }
  },
};

function createReportEmbed(context, bugDescription) {
  const isInteraction = context.constructor.name === 'CommandInteraction';
  const user = isInteraction ? context.user : context.author;
  const guild = isInteraction ? context.guild : context.guild;

  return new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle(`Reporte de @${user.tag} (${user.id})`)
    .setDescription(bugDescription)
    .addFields(
      { name: 'Servidor', value: guild ? `[${guild.name}](https://discord.gg/${guild.vanityURLCode || 'invite'})` : 'DM', inline: true }
    )
    .setTimestamp()
    .setFooter({ text: new Date().toLocaleString() });
}

