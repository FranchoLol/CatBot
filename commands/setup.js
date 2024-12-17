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
    .addFields(
      { name: 'Gabinete', value: setup.gabinetes?.name || 'No instalado', inline: true },
      { name: 'Motherboard', value: setup.motherboards?.name || 'No instalada', inline: true },
      { name: 'Procesador', value: setup.procesadores?.name || 'No instalado', inline: true },
      { name: 'RAM', value: setup.ram?.name || 'No instalada', inline: true },
      { name: 'Almacenamiento', value: setup.almacenamiento?.name || 'No instalado', inline: true },
      { name: 'Gráfica', value: setup.graficas?.name || 'No instalada', inline: true },
      { name: 'Fuente', value: setup.fuentes?.name || 'No instalada', inline: true },
      { name: 'Refrigeración', value: setup.refrigeracion?.name || 'No instalada', inline: true },
      { name: 'Monitor', value: setup.monitores?.name || 'No instalado', inline: true },
      { name: 'Teclado', value: setup.teclados?.name || 'No instalado', inline: true },
      { name: 'Mouse', value: setup.mouses?.name || 'No instalado', inline: true },
      { name: 'Mousepad', value: setup.mousepads?.name || 'No instalado', inline: true },
      { name: 'Conexión WiFi', value: setup.wifi?.name || 'No instalada', inline: true }
    );

  return embed;
}

