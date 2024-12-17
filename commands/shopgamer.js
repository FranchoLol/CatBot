const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getUserData, saveUserData, formatNumber } = require('../utils/helpers');
const pcComponents = require('../data/pc_components');
const { createNavigationRow } = require('../utils/button_handler');

module.exports = {
  name: 'shopgamer',
  description: 'Compra componentes para tu PC',
  usage: 'c!shopgamer [componente] [modelo]',
  run: async (client, message, args) => {
    const embed = await showShopCategories(message.author);
    message.reply({ embeds: [embed], components: createShopButtons() });
  },
  data: new SlashCommandBuilder()
    .setName('shopgamer')
    .setDescription('Compra componentes para tu PC'),
  async execute(interaction) {
    if (interaction.isButton()) {
      const [action, category, model] = interaction.customId.split('_');
      if (action === 'category') {
        const embed = await showComponentList(interaction.user, category);
        await interaction.update({ embeds: [embed], components: createComponentButtons(category) });
      } else if (action === 'buy') {
        await buyComponent(interaction, category, model);
      } else if (action === 'back') {
        const embed = await showShopCategories(interaction.user);
        await interaction.update({ embeds: [embed], components: createShopButtons() });
      }
    } else {
      const embed = await showShopCategories(interaction.user);
      await interaction.reply({ embeds: [embed], components: createShopButtons() });
    }
  },
};

async function showShopCategories(user) {
  const userData = getUserData(user.id);
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('ShopGamer - Categorías')
    .setDescription('Selecciona una categoría para ver los componentes disponibles:')
    .addFields(
      Object.keys(pcComponents).map(category => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: `Usa los botones para ver los modelos disponibles.`
      }))
    )
    .setFooter({ text: `Balance actual: U$S ${formatNumber(userData.balance)}` });

  return embed;
}

function createShopButtons() {
  const rows = [];
  const categories = Object.keys(pcComponents);
  for (let i = 0; i < categories.length; i += 5) {
    const row = new ActionRowBuilder();
    categories.slice(i, i + 5).forEach(category => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`category_${category}`)
          .setLabel(category.charAt(0).toUpperCase() + category.slice(1))
          .setStyle(ButtonStyle.Primary)
      );
    });
    rows.push(row);
  }

  rows.push(createNavigationRow('shop'));
  return rows;
}

async function showComponentList(user, category) {
  const userData = getUserData(user.id);
  const components = pcComponents[category];
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`ShopGamer - ${category.charAt(0).toUpperCase() + category.slice(1)}`)
    .setDescription('Modelos disponibles:')
    .addFields(
      components.map(component => ({
        name: component.name,
        value: getComponentDetails(component, category)
      }))
    )
    .setFooter({ text: `Balance actual: U$S ${formatNumber(userData.balance)}` });

  return embed;
}

function getComponentDetails(component, category) {
  let details = `Precio: U$S ${formatNumber(component.price)}\n`;
  
  switch (category) {
    case 'gabinetes':
      details += `Almacenamiento: ${component.storage}GB\n`;
      details += `Slots GPU: ${component.gpuSlots}\n`;
      details += `Factor de forma: ${component.formFactor.join(', ')}`;
      break;
    case 'motherboards':
      details += `Socket: ${component.socket}\n`;
      details += `RAM máx: ${component.maxRam}GB\n`;
      details += `Tipo RAM: ${component.ramType}\n`;
      details += `Velocidad RAM máx: ${component.maxRamSpeed}MHz\n`;
      details += `PCI-E: Gen ${component.pciVersion}`;
      break;
    case 'procesadores':
      details += `Socket: ${component.socket}\n`;
      details += `Núcleos/Hilos: ${component.cores}/${component.threads}\n`;
      details += `Velocidad: ${component.baseSpeed}-${component.boostSpeed}GHz`;
      break;
    case 'ram':
      details += `Capacidad: ${component.capacity}GB\n`;
      details += `Tipo: ${component.type}\n`;
      details += `Velocidad: ${component.speed}MHz`;
      break;
    case 'almacenamiento':
      details += `Capacidad: ${component.capacity}GB\n`;
      details += `Tipo: ${component.type}\n`;
      details += `Velocidad lectura/escritura: ${component.readSpeed}/${component.writeSpeed}MB/s`;
      break;
    case 'graficas':
      details += `VRAM: ${component.vram}GB\n`;
      details += `PCI-E: Gen ${component.pciVersion}`;
      break;
    case 'fuentes':
      details += `Potencia: ${component.wattage}W\n`;
      details += `Eficiencia: ${component.efficiency}`;
      break;
    case 'refrigeracion':
      details += `Tipo: ${component.type}\n`;
      details += `TDP: ${component.tdp}W`;
      break;
    case 'monitores':
      details += `Resolución: ${component.resolution}\n`;
      details += `Tasa de refresco: ${component.refreshRate}Hz\n`;
      details += `Tipo de panel: ${component.panelType}`;
      break;
    case 'teclados':
      details += `Tipo: ${component.type}\n`;
      details += `Distribución: ${component.layout}\n`;
      details += component.switches ? `Interruptores: ${component.switches}` : '';
      break;
    case 'mouses':
      details += `DPI: ${component.dpi}\n`;
      details += `Botones: ${component.buttons}\n`;
      details += `Sensor: ${component.sensor}`;
      break;
    case 'mousepads':
      details += `Tamaño: ${component.dimensions}`;
      break;
    case 'wifi':
      details += `Estándar: ${component.standard}\n`;
      details += `Velocidad máxima: ${component.maxSpeed}Mbps`;
      break;
  }
  
  return details;
}

function createComponentButtons(category) {
  const components = pcComponents[category];
  const rows = [];
  for (let i = 0; i < components.length; i += 5) {
    const row = new ActionRowBuilder();
    components.slice(i, i + 5).forEach(component => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`buy_${category}_${component.name}`)
          .setLabel(`${component.name}`)
          .setStyle(ButtonStyle.Secondary)
      );
    });
    rows.push(row);
  }

  const backButton = new ButtonBuilder()
    .setCustomId('back_to_categories')
    .setLabel('Volver a categorías')
    .setStyle(ButtonStyle.Danger);

  rows.push(new ActionRowBuilder().addComponents(backButton));
  rows.push(createNavigationRow('shop'));
  return rows;
}

async function buyComponent(interaction, category, model) {
  const userData = getUserData(interaction.user.id);
  const components = pcComponents[category];
  const component = components.find(c => c.name === model);

  if (!component) {
    return interaction.reply({ content: 'Modelo no válido.', ephemeral: true });
  }

  if (userData.balance < component.price) {
    return interaction.reply({ content: `No tienes suficiente dinero para comprar este componente. Necesitas U$S ${formatNumber(component.price)}.`, ephemeral: true });
  }

  const compatibilityCheck = isCompatible(userData, component, category);
  if (!compatibilityCheck.compatible) {
    return interaction.reply({ content: `Este componente no es compatible con tu configuración actual: ${compatibilityCheck.reason}`, ephemeral: true });
  }

  userData.balance -= component.price;
  if (!userData.setup) userData.setup = {};
  
  if (category === 'graficas' || category === 'ram') {
    if (!Array.isArray(userData.setup[category])) {
      userData.setup[category] = [];
    }
    userData.setup[category].push(component);
  } else {
    userData.setup[category] = component;
  }

  saveUserData({ [interaction.user.id]: userData });

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle(`Compra Exitosa`)
    .setDescription(`Has comprado ${component.name} por U$S ${formatNumber(component.price)}. Tu nuevo balance es U$S ${formatNumber(userData.balance)}.`);

  await interaction.update({ embeds: [embed], components: [] });

  // Enviar un nuevo mensaje después de 3 segundos con la lista de componentes actualizada
  setTimeout(async () => {
    const updatedEmbed = await showComponentList(interaction.user, category);
    await interaction.editReply({ embeds: [updatedEmbed], components: createComponentButtons(category) });
  }, 3000);
}

function isCompatible(userData, newComponent, componentType) {
  const setup = userData.setup;
  
  if (componentType === 'motherboards') {
    if (setup.gabinetes && !setup.gabinetes.formFactor.includes(newComponent.formFactor)) {
      return { compatible: false, reason: 'El factor de forma de la placa madre no es compatible con el gabinete.' };
    }
    if (setup.procesadores && setup.procesadores.socket !== newComponent.socket) {
      return { compatible: false, reason: 'El socket de la placa madre no es compatible con el procesador.' };
    }
    if (setup.ram && setup.ram[0].type !== newComponent.ramType) {
      return { compatible: false, reason: 'El tipo de RAM no es compatible con la placa madre.' };
    }
  }
  
  if (componentType === 'procesadores') {
    if (setup.motherboards && setup.motherboards.socket !== newComponent.socket) {
      return { compatible: false, reason: 'El socket del procesador no es compatible con la placa madre.' };
    }
  }
  
  if (componentType === 'ram') {
    if (setup.motherboards) {
      if (newComponent.type !== setup.motherboards.ramType) {
        return { compatible: false, reason: 'El tipo de RAM no es compatible con la placa madre.' };
      }
      if (newComponent.speed > setup.motherboards.maxRamSpeed) {
        return { compatible: false, reason: 'La velocidad de la RAM excede la máxima soportada por la placa madre.' };
      }
      const totalRam = (setup.ram ? setup.ram.reduce((sum, ram) => sum + ram.capacity, 0) : 0) + newComponent.capacity;
      if (totalRam > setup.motherboards.maxRam) {
        return { compatible: false, reason: 'La capacidad total de RAM excede el máximo soportado por la placa madre.' };
      }
    }
  }
  
  if (componentType === 'graficas') {
    if (setup.motherboards) {
      if (newComponent.pciVersion > setup.motherboards.pciVersion) {
        return { compatible: false, reason: 'La versión PCI-E de la tarjeta gráfica es superior a la soportada por la placa madre.' };
      }
      const gpuCount = setup.graficas ? setup.graficas.length : 0;
      if (gpuCount + 1 > setup.motherboards.maxGpu) {
        return { compatible: false, reason: 'Se ha alcanzado el número máximo de tarjetas gráficas soportadas por la placa madre.' };
      }
    }
    if (setup.gabinetes && setup.gabinetes.gpuSlots <= (setup.graficas ? setup.graficas.length : 0)) {
      return { compatible: false, reason: 'No hay más slots disponibles en el gabinete para tarjetas gráficas.' };
    }
  }
  
  if (componentType === 'fuentes') {
    const totalPower = calculateTotalPowerDraw(userData);
    if (newComponent.wattage < totalPower) {
      return { compatible: false, reason: `La potencia de la fuente (${newComponent.wattage}W) es insuficiente para el consumo total del sistema (${totalPower}W).` };
    }
  }
  
  return { compatible: true };
}

function calculateTotalPowerDraw(userData) {
  let totalPower = 0;
  const setup = userData.setup;
  if (setup.procesadores) totalPower += setup.procesadores.powerDraw;
  if (setup.graficas) totalPower += setup.graficas.reduce((sum, gpu) => sum + gpu.powerDraw, 0);
  if (setup.ram) totalPower += setup.ram.reduce((sum, ram) => sum + 10, 0); // Estimación de 10W por módulo de RAM
  if (setup.motherboards) totalPower += setup.motherboards.powerDraw;
  if (setup.almacenamiento) totalPower += 10; // Estimación de 10W para almacenamiento
  // Añadir un margen de seguridad del 20%
  return Math.ceil(totalPower * 1.2);
}

