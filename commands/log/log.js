const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logs } = require('../../bot-config.json');
const fs = require('node:fs');


function formatHash(hash) {
  const split = hash.match(/.{1,4}/g) || [];
  if (split.length == 0)
    return hash;
  return split.join(' ');
}

function formatNumber(num) {
  return num.toString()
    .split("").reverse().join("") // reverse
    .match(/.{1,3}/g).join(",") // group into 3's
    .split("").reverse().join(""); // reverse
}

function getShallengeDetails(file) {
  try {
    // check if file exists
    if (!fs.existsSync(file))
      return 'No log file found.';
    // check for existing data, load if found
    const data = fs.readFileSync(file, 'utf8');
    const rows = data.split('\n');
    if (rows.length <= 1)
      return 'No results found.';
    const last_row = rows[rows.length - 2];
    const cols = last_row.split('\t');

    // fields
    const hash = formatHash(cols[1]);
    const date = (new Date(cols[2])).toLocaleString();
    const check = formatNumber(cols[3]);

    return `Current lowest hash: \`${hash}..\`\nFound at **${date}**\nTries since previous: **${check}**`;
  } catch (err) {
    console.log(err);
  }
  return 'Error finding results.';
}

function getLastLogLine(file) {
  try {
    // check if file exists
    if (!fs.existsSync(file))
      return 'No log file found.';
    // check for existing data, load if found
    const data = fs.readFileSync(file, 'utf8');
    const rows = data.split('\n');
    if (rows.length <= 1)
      return 'No results found.';
    const last_row = rows[rows.length - 2];
    return `\`\`\`${last_row}`;
  } catch (err) {
    console.log(err);
  }
  return 'Error finding results.';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log')
    .setDescription('Display the output of a log file')
    .addStringOption(option =>
      option
        .setName('file')
        .setDescription('Select a log file from the list')
        .setRequired(true)
        .addChoices(...logs.filter(x => x.enabled === true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    const file = interaction.options.getString('file');
    const log = logs.filter(x => x.enabled === true && x.value === file)[0];

    let response = '';

    if (log.type === "shallenge") {
      response = getShallengeDetails(file);
    }
    else {
      response = getLastLogLine(file);
    }

    await interaction.reply(response);
  },
};
