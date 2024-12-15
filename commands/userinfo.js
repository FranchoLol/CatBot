const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const moment = require('moment');
moment.locale('es');

function formatDuration(duration) {
  const years = duration.years();
  const months = duration.months();
  const days = duration.days();
  const hours = duration.hours();

  if (years > 0) {
    return `${years} años, ${months} meses`;
  } else if (months > 0) {
    return `${months} meses, ${days} días`;
  } else if (days > 0) {
    return `${days} días, ${hours} horas`;
  } else {
    return `${hours} horas`;
  }
}

module.exports = {
  name: 'userinfo',
  description: 'Muestra información detallada sobre un usuario',
  usage: 'k!userinfo [@usuario|ID]',
  run: async (client, message, args) => {
    let user;
    if (args[0]) {
      user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    } else {
      user = message.author;
    }

    if (!user) {
      return message.reply('No se pudo encontrar al usuario especificado.');
    }

    const member = message.guild.members.cache.get(user.id);
    const accountAge = moment.duration(moment().diff(user.createdAt));
    const joinedAt = member ? moment.duration(moment().diff(member.joinedAt)) : null;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Información de Usuario`)
      .setDescription(`**User | Apodo | ID**
${user} | ${member?.nickname || 'Ninguno'} | ${user.id}

**Cuenta creada | Se unió al servidor**
${user.createdAt.toLocaleString()} (${formatDuration(accountAge)}) | ${member ? `${member.joinedAt.toLocaleString()} (${formatDuration(joinedAt)})` : 'No está en el servidor'}

**Bot | 2FA | Insignias**
${user.bot ? 'Sí' : 'No'} | ${member?.user.mfaEnabled ? 'Sí' : 'No'} | ${user.flags ? user.flags.toArray().map(flag => `\`${flag}\``).join(', ') || 'Ninguna' : 'Ninguna'}

**Roles**
${member ? member.roles.cache.filter(r => r.id !== message.guild.id).sort((a, b) => b.position - a.position).map(r => `<@&${r.id}>`).join(' ') || 'Ninguno' : 'No está en el servidor'}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Muestra información detallada sobre un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario del que quieres obtener información (mención o ID)')
        .setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const accountAge = moment.duration(moment().diff(user.createdAt));
    const joinedAt = member ? moment.duration(moment().diff(member.joinedAt)) : null;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Información de Usuario`)
      .setDescription(`**User | Apodo | ID**
${user} | ${member?.nickname || 'Ninguno'} | ${user.id}

**Cuenta creada | Se unió al servidor**
${user.createdAt.toLocaleString()} (${formatDuration(accountAge)}) | ${member ? `${member.joinedAt.toLocaleString()} (${formatDuration(joinedAt)})` : 'No está en el servidor'}

**Bot | 2FA | Insignias**
${user.bot ? 'Sí' : 'No'} | ${member?.user.mfaEnabled ? 'Sí' : 'No'} | ${user.flags ? user.flags.toArray().map(flag => `\`${flag}\``).join(', ') || 'Ninguna' : 'Ninguna'}

**Roles**
${member ? member.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position).map(r => `<@&${r.id}>`).join(' ') || 'Ninguno' : 'No está en el servidor'}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

