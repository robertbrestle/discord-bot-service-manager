const { servers, actions } = require('./bot-config.json');
var Docker = require('dockerode');

var docker = new Docker({socketPath: '/var/run/docker.sock'});

function listContainersAsync() {
  return new Promise((resolve, reject) => {
    docker.listContainers((err, containers) => {
      if (err) reject(err);
      else resolve(containers)
    });
  });
}

function inspectContainerAsync(containerId) {
  return new Promise((resolve, reject) => {
    const container = docker.getContainer(containerId);
    container.inspect((err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function runContainerActionAsync(containerId, action) {
  return new Promise((resolve, reject) => {
    const container = docker.getContainer(containerId);
    if (action === 'start') {
      container.start(function (err, data) {
        if (err) reject(err);
        else resolve(data)
      })
    }
    else if (action === 'stop') {
      container.stop(function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    }
  });
}

async function getRunningContainers() {
  try {
    const containers = await listContainersAsync();
    var list = [];
    for (const container of containers) {
      const data = await inspectContainerAsync(container.Id);
      list.push({
        'name': data.Name.substring(1),
        'status': data.State.Status,
        'uptime': data.State.StartedAt
      });
    }
    return list;
  } catch (err) {
    console.error('getRunningContainers error:', err);
    return [];
  }
}

async function runActionAsync(name, action) {
  // validate name
  const foundContainers = servers.filter(x => x.enabled === true && x.type === 'docker' && x.value === name);
  if (foundContainers.length == 0) {
    return 'Container not found.';
  }

  // validate action
  const foundActions = actions.filter(x => x.value === action);
  if (foundActions.length == 0) {
    return 'Invalid action.';
  }

  // TODO: implement
  if (action === 'restart') {
    return 'Restart is not yet available for docker containers.';
  }

  try {
    // get container
    const container = await inspectContainerAsync(name);
    
    // if status command
    if (action === 'status') {
      let status = container.State.Status;
      let formattedDate = new Date(container.State.StartedAt).toString();
      switch (container.State.Status) {
        case 'exited':
          status = 'stopped';
          formattedDate = new Date(container.State.FinishedAt).toString();
          break;
        default:
          break;
      }
      // return formatted results
      return `${foundContainers[0].name} container is ${status} since ${formattedDate}.`;
    }

    // prevent invalid actions
    if (!container.State.Running && action === 'stop') {
      return `${foundContainers[0].name} container is already stopped.`;
    }
    else if (container.State.Running && action === 'start') {
      return `${foundContainers[0].name} container is already running.`;
    }

    // else if start/stop
    await runContainerActionAsync(name, action);

    return `${foundContainers[0].name} container successfully ${foundActions[0].successMessage}.`;

  } catch (err) {
    console.log(err);
    return `Error referencing container for ${foundContainers[0].name}.`;
  }
}

module.exports = {
  getRunningContainers,
  runActionAsync
};