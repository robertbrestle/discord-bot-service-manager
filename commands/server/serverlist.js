const { SlashCommandBuilder } = require('discord.js');
const { table } = require('table');
const { servers } = require('../../bot-config.json');

const serviceHelper = require('../../service-helper.js');
const dockerHelper = require('../../docker-helper.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverlist')
    .setDescription('View the status of the available servers'),
  async execute(interaction) {
    // fetch servers from configuration JSON that are enabled
    var enabledServers = servers.filter(x => x.enabled === true);
    
    // fetch enabled services
    var serviceStatusList = serviceHelper.getEnabledServiceStatusList();

    // fetch running containers and services
    var runningContainers = await dockerHelper.getRunningContainers();

    // build the table array
    var list = [];
    list.push(['NAME', 'STATUS']);
    for (let i = 0; i < enabledServers.length; i++) {
      // default as "stopped"
      var status = "stopped";

      // check running containers
      var foundContainer = runningContainers.filter(x => x.name === enabledServers[i].value);
      // if found, set to status
      if (foundContainer.length > 0)
        status = foundContainer[0].status;

      // check services
      var foundServiceStatus = serviceStatusList[enabledServers[i].value];
      if (foundServiceStatus != null)
        status = foundServiceStatus;

      
      list.push([enabledServers[i].name, status]);
    }
    // create and display table
    var servertable = table(list);
    await interaction.reply(`\`\`\`${servertable}\`\`\``);
  },
};
