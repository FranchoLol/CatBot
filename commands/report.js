const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { checkCooldown, isValidContent, incrementReportCount } = require('../utils/reportUtils');

module.exports = {
  name: 'report',
  description: 'Reporta un bug o problema del bot',
  usage: 'c!report <descripción del bug>',
  run: async (client, message, args) => {
    const cooldownMinutes = await checkCooldown(message.author.id, 'report');
    let remainingMinutes = cooldownMinutes;
    if (remainingMinutes > 0) {
      const cooldownEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setDescription(`Por favor, espera \`${remainingMinutes}\` minutos antes de enviar otro reporte.`);
      
      const cooldownMsg = await message.reply({ embeds: [cooldownEmbed] });
      
      const interval = setInterval(() => {
        remainingMinutes--;
        if (remainingMinutes <= 0) {
          clearInterval(interval);
          cooldownMsg.delete().catch(console.error);
        } else {
          cooldownEmbed.setDescription(`Por favor, espera \`${remainingMinutes}\` minutos antes de enviar otro reporte.`);
          cooldownMsg.edit({ embeds: [cooldownEmbed] }).catch(console.error);
        }
      }, 60000); // Actualizar cada minuto
      
      return;
    }

    const bugDescription = args.join(' ');
    if (!isValidContent(bugDescription)) {
      return message.reply('Por favor, proporciona una descripción válida y detallada del bug (mínimo 10 caracteres).');
    }

    const reportEmbed = await createReportEmbed(message, bugDescription);

    const reportChannel = await client.channels.fetch('1319114589845323787').catch(console.error);
    if (!reportChannel) {
      console.log('Canal de reportes no encontrado o no accesible');
      return message.reply('Hubo un problema al enviar tu reporte. Por favor, contacta a un administrador.');
    }

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
    let remainingMinutes = cooldownMinutes;
    if (remainingMinutes > 0) {
      const cooldownEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setDescription(`Por favor, espera \`${remainingMinutes}\` minutos antes de enviar otro reporte.`);
      
      const cooldownMsg = await interaction.reply({ embeds: [cooldownEmbed], ephemeral: true, fetchReply: true });
      
      const interval = setInterval(() => {
        remainingMinutes--;
        if (remainingMinutes <= 0) {
          clearInterval(interval);
          cooldownMsg.delete().catch(console.error);
        } else {
          cooldownEmbed.setDescription(`Por favor, espera \`${remainingMinutes}\` minutos antes de enviar otro reporte.`);
          interaction.editReply({ embeds: [cooldownEmbed] }).catch(console.error);
        }
      }, 60000); // Actualizar cada minuto
      
      return;
    }

    const bugDescription = interaction.options.getString('descripcion');
    if (!isValidContent(bugDescription)) {
      return interaction.reply({ content: 'Por favor, proporciona una descripción válida y detallada del bug (mínimo 10 caracteres).', ephemeral: true });
    }

    const reportEmbed = await createReportEmbed(interaction, bugDescription);

    const reportChannel = await interaction.client.channels.fetch('1319114589845323787').catch(console.error);
    if (!reportChannel) {
      console.log('Canal de reportes no encontrado o no accesible');
      return interaction.reply({ content: 'Hubo un problema al enviar tu reporte. Por favor, contacta a un administrador.', ephemeral: true });
    }

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

async function createReportEmbed(context, bugDescription) {
  const isInteraction = context.constructor.name === 'CommandInteraction';
  const user = isInteraction ? context.user : context.author;
  const guild = isInteraction ? context.guild : context.guild;
  const reportNumber = await incrementReportCount();

  let inviteLink = 'No disponible';
  if (guild) {
    try {
      inviteLink = guild.vanityURLCode || 
        (await guild.invites.create(guild.systemChannelId || guild.channels.cache.first().id, { maxAge: 0, maxUses: 0 })).code;
      inviteLink = `https://discord.gg/${inviteLink}`;
    } catch (error) {
      console.error('Error creating invite:', error);
      inviteLink = 'No se pudo crear una invitación';
    }
  }

  return new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle(`Reporte #${reportNumber}`)
    .setDescription(`Descripción: ${bugDescription}
Usuario: <@${user.id}>
Servidor: [${guild ? guild.name : 'DM'}](${inviteLink})`)
    .setTimestamp()
    .setFooter({ text: new Date().toLocaleString() });
}

