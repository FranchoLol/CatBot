const fs = require('fs').promises;
const path = require('path');

const autoroleFile = path.join(__dirname, '..', 'data', 'autoroles.json');

async function getAutoroles() {
  try {
    const data = await fs.readFile(autoroleFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function saveAutoroles(autoroles) {
  await fs.writeFile(autoroleFile, JSON.stringify(autoroles, null, 2));
}

module.exports = { getAutoroles, saveAutoroles };

