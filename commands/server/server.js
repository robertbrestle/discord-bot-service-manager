const { SlashCommandBuilder } = require('discord.js');
const { servers, actions } = require('../../bot-config.json');

const serviceHelper = require('../../service-helper.js');
const dockerHelper = require('../../docker-helper.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Run actions against the available game servers')
    .addStringOption(option =>
      option
        .setName('game')
        .setDescription('Select a game server from the list')
        .setRequired(true)
        .addChoices(...servers.filter(x => x.enabled === true))
    )
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Select an action for the game server')
        .setRequired(true)
        .addChoices(...actions)),
	async execute(interaction) {

    //interaction.options.get('game').choices = servers;

		const game = interaction.options.getString('game');
    const action = interaction.options.getString('action');

    // check if enabled server exists
    let foundServers = servers.filter(x => x.enabled === true && x.value === game);
    if (foundServers.length == 0) {
      await interaction.reply(`Server not found.`);
    }
    else {
      // set to defer for long-running operations
      await interaction.deferReply();
      
      var result = '';
      // perform action based on type
      switch (foundServers[0].type) {
        case 'docker':
          result = await dockerHelper.runActionAsync(game, action);
          break;
        case 'service':
          result = serviceHelper.runAction(game, action);
          break;
        default:
          result = 'Invalid server type.';
          break;
      }
      // edit the reply with the result
      await interaction.editReply(result);
    }
	},
};