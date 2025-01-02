const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

// Simulating Discord.js client and guilds
const client = {
  guilds: {
    cache: new Map([
      ['guild1', {
        name: 'Test Guild 1',
        emojis: {
          cache: new Map([
            ['emoji1', { name: 'test_emoji1', animated: false, url: 'https://cdn.discordapp.com/emojis/123456789.png' }],
            ['emoji2', { name: 'test_emoji2', animated: true, url: 'https://cdn.discordapp.com/emojis/987654321.gif' }]
          ])
        }
      }]
    ])
  }
};

async function getAllEmojis(client) {
  const zip = new AdmZip();
  const tempDir = path.join(__dirname, 'temp_emojis');

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  for (const [guildId, guild] of client.guilds.cache) {
    const guildDir = path.join(tempDir, guild.name);
    if (!fs.existsSync(guildDir)) {
      fs.mkdirSync(guildDir);
    }

    for (const [emojiId, emoji] of guild.emojis.cache) {
      const extension = emoji.animated ? 'gif' : 'png';
      const fileName = `${emoji.name}.${extension}`;
      const filePath = path.join(guildDir, fileName);

      console.log(`Downloading ${fileName} from ${emoji.url}`);
      const response = await fetch(emoji.url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fs.writeFileSync(filePath, buffer);
      zip.addLocalFile(filePath);
    }
  }

  const zipFilePath = path.join(tempDir, 'all_emojis.zip');
  zip.writeZip(zipFilePath);

  console.log(`Zip file created at: ${zipFilePath}`);

  // Clean up
  fs.rmSync(tempDir, { recursive: true, force: true });
}

getAllEmojis(client);

