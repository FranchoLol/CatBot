const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { checkCooldown, isValidContent, incrementSuggestionCount } = require('../utils/reportUtils');

module.exports = {
  name: 'suggest',
  description: 'Sugiere una mejora o nueva característica para el bot',
  usage: 'c!suggest <descripción de la sugerencia>',
  run: async (client, message, args) => {
    const cooldownMinutes = await checkCooldown(message.author.id, 'suggest');
    let remainingMinutes = cooldownMinutes;
    if (remainingMinutes > 0) {
      const cooldownEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setDescription(`Por favor, espera \`${remainingMinutes}\` minutos antes de enviar otra sugerencia.`);
      
      const cooldownMsg = await message.reply({ embeds: [cooldownEmbed] });
      
      const interval = setInterval(() => {
        remainingMinutes--;
        if (remainingMinutes <= 0) {
          clearInterval(interval);
          cooldownMsg.delete().catch(console.error);
        } else {
          cooldownEmbed.setDescription(`Por favor, espera \`${remainingMinutes}\` minutos antes de enviar otra sugerencia.`);
          cooldownMsg.edit({ embeds: [cooldownEmbed] }).catch(console.error);
        }
      }, 60000); // Actualizar cada minuto
      
      return;
    }

    const suggestion = args.join(' ');
    if (!isValidContent(suggestion)) {
      return message.reply('Por favor, proporciona una descripción válida y detallada de tu sugerencia (mínimo 10 caracteres).');
    }

    const suggestionEmbed = await createSuggestionEmbed(message, suggestion);

    const suggestionChannel = await client.channels.fetch('1319114611424890951').catch(console.error);
    if (!suggestionChannel) {
      console.log('Canal de sugerencias no encontrado o no accesible');
      return message.reply('Hubo un problema al enviar tu sugerencia. Por favor, contacta a un administrador.');
    }

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
    let remainingMinutes = cooldownMinutes;
    if (remainingMinutes > 0) {
      const cooldownEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setDescription(`Por favor, espera \`${remainingMinutes}\` minutos antes de enviar otra sugerencia.`);
      
      const cooldownMsg = await interaction.reply({ embeds: [cooldownEmbed], ephemeral: true, fetchReply: true });
      
      const interval = setInterval(() => {
        remainingMinutes--;
        if (remainingMinutes <= 0) {
          clearInterval(interval);
          cooldownMsg.delete().catch(console.error);
        } else {
          cooldownEmbed.setDescription(`Por favor, espera \`${remainingMinutes}\` minutos antes de enviar otra sugerencia.`);
          cooldownMsg.edit({ embeds: [cooldownEmbed] }).catch(console.error);
        }
      }, 60000); // Actualizar cada minuto
      
      return;
    }

    const suggestion = interaction.options.getString('sugerencia');
    if (!isValidContent(suggestion)) {
      return interaction.reply({ content: 'Por favor, proporciona una descripción válida y detallada de tu sugerencia (mínimo 10 caracteres).', ephemeral: true });
    }

    const suggestionEmbed = await createSuggestionEmbed(interaction, suggestion);

    const suggestionChannel = await interaction.client.channels.fetch('1319114611424890951').catch(console.error);
    if (!suggestionChannel) {
      console.log('Canal de sugerencias no encontrado o no accesible');
      return interaction.reply({ content: 'Hubo un problema al enviar tu sugerencia. Por favor, contacta a un administrador.', ephemeral: true});
    }

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

async function createSuggestionEmbed(context, suggestion) {
  const isInteraction = context.constructor.name === 'CommandInteraction';
  const user = isInteraction ? context.user : context.author;
  const guild = isInteraction ? context.guild : context.guild;
  const suggestionNumber = await incrementSuggestionCount();

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
    .setColor('#00FF00')
    .setTitle(`Sugerencia #${suggestionNumber}`)
    .setDescription(`Descripción: ${suggestion}
Usuario: <@${user.id}>
Servidor: [${guild ? guild.name : 'DM'}](${inviteLink})`)
    .setTimestamp()
    .setFooter({ text: new Date().toLocaleString() });
}

