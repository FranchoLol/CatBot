const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Removed: const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, 'temp_emojis');

module.exports = {
  name: 'getallemojis',
  description: 'Obtiene todos los emojis de todos los servidores (solo para el propietario)',
  usage: 'c!getallemojis',
  run: async (client, message, args) => {
    if (message.author.id !== '561667004755345447') {
      return message.reply('Este comando solo puede ser utilizado por el propietario del bot.');
    }

    if (isCommandRunning) {
      return message.reply('El comando ya está en ejecución. Por favor, espera a que termine.');
    }

    const currentTime = Date.now();
    if (currentTime - lastExecutionTime < 15000) {
      const remainingTime = Math.ceil((15000 - (currentTime - lastExecutionTime)) / 1000);
      return message.reply(`Por favor, espera ${remainingTime} segundos antes de ejecutar el comando nuevamente.`);
    }

    isCommandRunning = true;
    lastExecutionTime = currentTime;

    try {
      await getAllEmojis(client, message);
    } finally {
      isCommandRunning = false;
    }
  },
  data: new SlashCommandBuilder()
    .setName('getallemojis')
    .setDescription('Obtiene todos los emojis de todos los servidores (solo para el propietario)'),
  async execute(interaction) {
    if (interaction.user.id !== '561667004755345447') {
      return interaction.reply({ content: 'Este comando solo puede ser utilizado por el propietario del bot.', ephemeral: true });
    }

    if (isCommandRunning) {
      return interaction.reply({ content: 'El comando ya está en ejecución. Por favor, espera a que termine.', ephemeral: true });
    }

    const currentTime = Date.now();
    if (currentTime - lastExecutionTime < 15000) {
      const remainingTime = Math.ceil((15000 - (currentTime - lastExecutionTime)) / 1000);
      return interaction.reply({ content: `Por favor, espera ${remainingTime} segundos antes de ejecutar el comando nuevamente.`, ephemeral: true });
    }

    isCommandRunning = true;
    lastExecutionTime = currentTime;

    try {
      await interaction.deferReply();
      await getAllEmojis(interaction.client, interaction);
    } finally {
      isCommandRunning = false;
    }
  },
};

async function getAllEmojis(client, context) {
  const zip = new AdmZip();
  const tempDir = path.join(__dirname, 'temp_emojis');
  await fs.ensureDir(tempDir);

  const totalGuilds = client.guilds.cache.size;
  let processedGuilds = 0;
  let totalEmojis = 0;
  let totalGifs = 0;
  let totalSize = 0;

  const statsEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Descargando emojis')
    .addFields(
      { name: 'Progreso', value: 'Iniciando...', inline: false },
      { name: 'Total de emojis', value: '0', inline: true },
      { name: 'Total de GIFs', value: '0', inline: true },
      { name: 'Total de ambos', value: '0', inline: true }
    )
    .setFooter({ text: 'Tiempo estimado: Calculando...' });

  const statsMessage = await (context.reply ? context.reply({ embeds: [statsEmbed] }) : context.channel.send({ embeds: [statsEmbed] }));

  const startTime = Date.now();
  let serverFields = [];

  for (const [guildId, guild] of client.guilds.cache) {
    const guildDir = path.join(tempDir, guildId);
    const emojisDir = path.join(guildDir, 'emojis');
    const gifsDir = path.join(guildDir, 'gifs');

    await fs.ensureDir(emojisDir);
    await fs.ensureDir(gifsDir);

    let guildEmojis = 0;
    let guildGifs = 0;
    let guildSize = 0;

    for (const [emojiId, emoji] of guild.emojis.cache) {
      const extension = emoji.animated ? 'gif' : 'png';
      const fileName = `${emoji.name}.${extension}`;
      const filePath = path.join(emoji.animated ? gifsDir : emojisDir, fileName);

      if (!await fs.pathExists(filePath)) {
        const response = await fetch(emoji.url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fs.writeFile(filePath, buffer);
        
        // Add file to the correct folder in the zip
        const zipPath = emoji.animated ? `gifs/${fileName}` : `emojis/${fileName}`;
        zip.addFile(zipPath, buffer);

        const fileSize = buffer.length;
        guildSize += fileSize;
        totalSize += fileSize;

        if (emoji.animated) {
          guildGifs++;
          totalGifs++;
        } else {
          guildEmojis++;
          totalEmojis++;
        }
      }
    }

    processedGuilds++;

    // Agregar campo para este servidor
    serverFields.push({
      name: `**${guild.name}**`,
      value: `> ${guildEmojis + guildGifs} (${formatBytes(guildSize)})`,
      inline: true
    });

    const progress = (processedGuilds / totalGuilds) * 100;
    const progressBar = createDetailedProgressBar(progress);

    const elapsedTime = Date.now() - startTime;
    const estimatedTotalTime = (elapsedTime / processedGuilds) * totalGuilds;
    const remainingTime = estimatedTotalTime - elapsedTime;

    // Actualizar el embed con todos los campos
    statsEmbed.spliceFields(0, statsEmbed.data.fields.length);

    // Agregar los campos de servidores
    statsEmbed.addFields(...serverFields);

    // Agregar los campos de estadísticas
    statsEmbed.addFields(
      { name: 'Progreso', value: progressBar, inline: false },
      { name: 'Total de emojis', value: `${totalEmojis} (${formatBytes(totalSize - totalGifs)})`, inline: true },
      { name: 'Total de GIFs', value: `${totalGifs} (${formatBytes(totalGifs)})`, inline: true },
      { name: 'Total de ambos', value: `${totalEmojis + totalGifs} (${formatBytes(totalSize)})`, inline: true }
    );

    statsEmbed.setFooter({ text: `Tiempo estimado: ${formatTime(remainingTime)}` });

    await statsMessage.edit({ embeds: [statsEmbed] });
  }

  const zipFilePath = path.join(tempDir, 'all_emojis.zip');
  zip.writeZip(zipFilePath);

  const zipSize = fs.statSync(zipFilePath).size;
  const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

  if (zipSize > MAX_FILE_SIZE) {
    const parts = await splitZipFile(zipFilePath, MAX_FILE_SIZE);
    const attachments = parts.map((part, index) =>
      new AttachmentBuilder(part, { name: `all_emojis_part${index + 1}.zip` })
    );

    statsEmbed.setTitle('Descarga completada (Archivo dividido)')
      .setDescription(`El archivo ha sido dividido en ${parts.length} partes debido a su tamaño.`)
      .setFooter({ text: `Tiempo total: ${formatTime(Date.now() - startTime)}` });

    if (context.editReply) {
      for (let i = 0; i < attachments.length; i++) {
        if (i === 0) {
          await context.editReply({ embeds: [statsEmbed], files: [attachments[i]] });
        } else {
          await context.followUp({ files: [attachments[i]] });
        }
      }
    } else {
      await statsMessage.edit({ embeds: [statsEmbed], files: [attachments[0]] });
      for (let i = 1; i < attachments.length; i++) {
        await context.channel.send({ files: [attachments[i]] });
      }
    }

    // Limpiar los archivos temporales
    parts.forEach(part => fs.removeSync(part));
  } else {
    const attachment = new AttachmentBuilder(zipFilePath, { name: 'all_emojis.zip' });

    statsEmbed.setTitle('Descarga completada')
      .setFooter({ text: `Tiempo total: ${formatTime(Date.now() - startTime)}` });

    if (context.editReply) {
      await context.editReply({ embeds: [statsEmbed], files: [attachment] });
    } else {
      await statsMessage.edit({ embeds: [statsEmbed], files: [attachment] });
    }
  }

  // Clean up
  await fs.remove(tempDir);
}

async function splitZipFile(filePath, maxSize) {
  const zip = new AdmZip(filePath);
  const zipEntries = zip.getEntries();
  const parts = [];
  let currentPart = new AdmZip();
  let currentSize = 0;
  let partIndex = 1;

  for (const entry of zipEntries) {
    const entrySize = entry.header.size;
    if (currentSize + entrySize > maxSize) {
      const partPath = `${filePath}.part${partIndex}`;
      currentPart.writeZip(partPath);
      parts.push(partPath);
      currentPart = new AdmZip();
      currentSize = 0;
      partIndex++;
    }
    currentPart.addFile(entry.entryName, entry.getData());
    currentSize += entrySize;
  }

  if (currentSize > 0) {
    const partPath = `${filePath}.part${partIndex}`;
    currentPart.writeZip(partPath);
    parts.push(partPath);
  }

  return parts;
}

function createDetailedProgressBar(progress) {
  const filledLength = Math.round(20 * progress / 100);
  const emptyLength = 20 - filledLength;
  return `[${'█'.repeat(filledLength)}${'-'.repeat(emptyLength)}] ${progress.toFixed(2)}%`;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0 || parts.length === 0) parts.push(`${seconds % 60}s`);

  return parts.join(' ');
}

let isCommandRunning = false;
let lastExecutionTime = 0;

