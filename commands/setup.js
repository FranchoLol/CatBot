const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getUserData } = require('../utils/helpers');
const { createNavigationRow } = require('../utils/button_handler');

module.exports = {
  name: 'setup',
  description: 'Muestra tu configuración de PC actual',
  usage: 'c!setup [@usuario/id]',
  run: async (client, message, args) => {
    const target = message.mentions.users.first() || message.author;
    const userData = getUserData(target.id);
    const embed = createSetupEmbed(target, userData);
    message.reply({ embeds: [embed], components: [createNavigationRow('setup')] });
  },
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Muestra tu configuración de PC actual')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario del que quieres ver el setup')
        .setRequired(false)),
  async execute(interaction) {
    const target = interaction.options?.getUser('usuario') || interaction.user;
    const userData = getUserData(target.id);
    const embed = createSetupEmbed(target, userData);
    
    const response = { embeds: [embed], components: [createNavigationRow('setup')] };
    
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(response);
    } else {
      await interaction.reply(response);
    }
  },
};

function createSetupEmbed(user, userData) {
  const setup = userData.setup || {};
  
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`Setup de ${user.tag}`)
    ;

if (setup.gabinetes) {
  embed.addFields({
    name: 'Gabinete',
    value: `${setup.gabinetes.name}
Almacenamiento: ${setup.gabinetes.storage}GB
Slots GPU: ${setup.gabinetes.gpuSlots}
Factor de forma: ${setup.gabinetes.formFactor ? setup.gabinetes.formFactor.join(', ') : 'N/A'}`,
    inline: true
  });
} else {
  embed.addFields({ name: 'Gabinete', value: 'No instalado', inline: true });
}

  if (setup.motherboards) {
    embed.addFields({
      name: 'Motherboard',
      value: `${setup.motherboards.name} (${setup.motherboards.chipset})`,
      inline: true
    });
  } else {
    embed.addFields({ name: 'Motherboard', value: 'No instalada', inline: true });
  }

  if (setup.procesadores) {
    embed.addFields({
      name: 'Procesador',
      value: `${setup.procesadores.name} (${setup.procesadores.cores} Cores, ${setup.procesadores.threads} Threads)`,
      inline: true
    });
  } else {
    embed.addFields({ name: 'Procesador', value: 'No instalado', inline: true });
  }

  if (setup.ram && setup.ram.length > 0) {
    const totalRam = setup.ram.reduce((total, ram) => total + ram.capacity, 0);
    const ramDetails = setup.ram.map(ram => `${ram.name} (${ram.capacity}GB ${ram.type}-${ram.speed})`).join('\n');
    embed.addFields({
      name: 'Memoria RAM',
      value: `Total: ${totalRam}GB\n${ramDetails}`,
      inline: true
    });
  } else {
    embed.addFields({ name: 'Memoria RAM', value: 'No instalada', inline: true });
  }

  if (setup.almacenamiento) {
    embed.addFields({
      name: 'Almacenamiento',
      value: `${setup.almacenamiento.name} (${setup.almacenamiento.capacity}GB)`,
      inline: true
    });
  } else {
    embed.addFields({ name: 'Almacenamiento', value: 'No instalado', inline: true });
  }

  if (setup.graficas && setup.graficas.length > 0) {
    const gpuDetails = setup.graficas.map(gpu => `${gpu.name} (${gpu.vram}GB VRAM, PCI-E Gen ${gpu.pciVersion})`).join('\n');
    embed.addFields({
      name: 'Tarjeta(s) Gráfica(s)',
      value: gpuDetails,
      inline: true
    });
  } else {
    embed.addFields({ name: 'Tarjeta Gráfica', value: 'No instalada', inline: true });
  }

  if (setup.fuentes) {
    embed.addFields({
      name: 'Fuente',
      value: `${setup.fuentes.name} (${setup.fuentes.wattage}W)`,
      inline: true
    });
  } else {
    embed.addFields({ name: 'Fuente', value: 'No instalada', inline: true });
  }

  if (setup.refrigeracion) {
    embed.addFields({
      name: 'Refrigeración',
      value: setup.refrigeracion.name,
      inline: true
    });
  } else {
    embed.addFields({ name: 'Refrigeración', value: 'No instalada', inline: true });
  }

  if (setup.monitores) {
    embed.addFields({
      name: 'Monitor',
      value: `${setup.monitores.name} (${setup.monitores.size}\"${setup.monitores.resolution})`,
      inline: true
    });
  } else {
    embed.addFields({ name: 'Monitor', value: 'No instalado', inline: true });
  }

  if (setup.teclados) {
    embed.addFields({
      name: 'Teclado',
      value: setup.teclados.name,
      inline: true
    });
  } else {
    embed.addFields({ name: 'Teclado', value: 'No instalado', inline: true });
  }

  if (setup.mouses) {
    embed.addFields({
      name: 'Mouse',
      value: setup.mouses.name,
      inline: true
    });
  } else {
    embed.addFields({ name: 'Mouse', value: 'No instalado', inline: true });
  }

  if (setup.mousepads) {
    embed.addFields({
      name: 'Mousepad',
      value: setup.mousepads.name,
      inline: true
    });
  } else {
    embed.addFields({ name: 'Mousepad', value: 'No instalado', inline: true });
  }

  if (setup.wifi) {
    embed.addFields({
      name: 'Conexión WiFi',
      value: setup.wifi.name,
      inline: true
    });
  } else {
    embed.addFields({ name: 'Conexión WiFi', value: 'No instalada', inline: true });
  }

  return embed;
}

function calculateSetupBoost(setup) {
  let boost = 1;
  Object.values(setup).forEach(component => {
    if (Array.isArray(component)) {
      component.forEach(item => {
        if (item && item.boost) boost += item.boost;
      });
    } else if (component && component.boost) {
      boost += component.boost;
    }
  });
  return boost;
}

 