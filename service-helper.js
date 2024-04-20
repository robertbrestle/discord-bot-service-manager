const { exec } = require('shelljs');
const { servers, actions } = require('./bot-config.json');

/**
 * Fetch the service status
 * @param {string} name - the name of the service
 * @param {bool} detailed - if results should be detailed
 * @returns service status string
 */
function getServiceStatus(name, detailed) {
  // validate name
  const foundService = servers
    .filter(x => x.enabled === true && x.type === 'service' && x.value === name);
  if (foundService.length == 0)
    return 'Service not found.';

  // execute command
  const commandResult = exec(`systemctl status ${name}.service | grep Active:`, { silent: true });
  // if detailed, return full results
  if (detailed) {
    if (commandResult.stderr.length > 0)
      return commandResult.stderr;
    else
      return commandResult.stdout
        .replace(/^\s*Active:\s/, '') // grab correct section
        .replace(/\n$/, ''); // remove trailing newline
  }
  else // else return short result
  {
    if (commandResult.stderr.length > 0)
      return 'error';
    else {
      const commandStatus = /\(([^)]+)\)/.exec(commandResult.stdout);
      let status = commandStatus[1];
      //override status mapping
      switch (status) {
        case 'dead':
          status = 'stopped';
          break;
        default:
          break;
      }
      return status;
    }
  }
}

/**
 * Fetch all enabled services and their associated status
 * @returns nested array of server statuses
 */
function getEnabledServiceStatusList() {
  let results = {};

  const enabledServices = servers
    .filter(x => x.enabled === true && x.type == 'service')
    .map(function(x) { return x.value });

  // if no services found, return empty
  if (enabledServices.length == 0)
    return results;

  // build nested array for table rendering
  for (let i = 0; i < enabledServices.length; i++) {
      results[enabledServices[i]] = getServiceStatus(enabledServices[i], false);
  }

  return results;
}

/**
 * Run an action against an enabled service using shelljs
 * @param {string} name - name of the service
 * @param {string} action - name of the action
 * @returns status message
 */
function runAction(name, action) {
  // validate name
  const foundServices = servers.filter(x => x.enabled === true && x.type === "service" && x.value === name);
  if (foundServices.length == 0) {
    return 'Service not found.';
  }

  // validate action
  const foundActions = actions.filter(x => x.value === action);
  if (foundActions.length == 0) {
    return 'Invalid action.';
  }

  // if status command, use other method
  if (action === 'status') {
    const status = getServiceStatus(name, true);
    return `${foundServices[0].name} service is ${status}`;
  }

  // execute command
  const commandResult = exec(`sudo systemctl ${action} ${name}.service`, { silent: true });

  // if has error, show; else show result
  if (commandResult.stderr.length > 0)
    return commandResult.stderr;
  else 
    return `${foundServices[0].name} service successfully ${foundActions[0].successMessage}.`;

}

module.exports = {
  getServiceStatus,
  getEnabledServiceStatusList,
  runAction
}