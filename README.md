# Discord Bot Service Manager
A discord.js bot for managing systemd services and docker containers running on its host machine.

This bot was built using Node.js 21 and Ubuntu 22.04.

While this was a fun personal project, the security implications can be a bit concerning. Please use your best judgement and harden your environments as much as possible. Use this bot at your own risk!

***DO NOT RUN THIS BOT AS ROOT!***

&nbsp;

# Configuration

## token-config.json
This configuration file contains the authentication this bot needs to interact with your Discord application. For more information, visit the [Discord Developer Portal](https://discord.com/developers/docs/intro).

- `token` = the secret Token of your application
   - [Discord Developer Portal](https://discord.com/developers/applications) > {Your Application} > Bot > (Reset) Token
- `clientId` = the Application ID of your application
   - [Discord Developer Portal](https://discord.com/developers/applications) > {Your Application}
- `guildId` = the Discord server you want to add this bot to
   - Open the Discord app > App Settings > Advanced > Developer Mode (enable)

## bot-config.json
This configuration file contains the servers and actions you want this bot to perform.

The `servers` array contains the servers the bot should interact with, assuming the `enabled` flag is set to `true`.

`server` object:
- `name` = string; the display name of the server  
- `value` = string; the actual name of the server process  
   - systemd: this is the named `.service` file (ie a value of `foo` would represent `foo.service`)  
   - docker: this is the name of the container (ie `bar` would represent a container named `bar`)  
- `description` = string; the description of the server; currently unused  
- `type` = string; the type of server; either `docker` or `service`  
- `port` = num; the port used by the server  
   - only displays on successful `start` or `status` command  
- `enabled` = bool; flag for enabling or disabling the visibility of the server in slash commands  
   - you will need to redeploy the commands and restart the bot after changing these values  

&nbsp;

The `actions` array contains valid actions a user can run against servers using the `/server` command.

`action` object:
- `name` = string; the display name of the action  
- `value` = string; the value of the action  
   - systemd: this value is fed into `systemctl` calls  
   - docker: referenced against hard-coded values to interact with Docker containers  
- `successMessage` = string; the friendly value after the action has been run successfully  

The structure of `action` objects will change in the future to better represent docker containers and systemd services.

# Setup
For initial setup, update `token-config.json` with your application and server tokens and update `bot-config.json` with the servers and actions.

## Services
To ensure a higher level of security, create a new user and group to run the bot and assign services to them. This prevents the need to run the bot as root while providing all of the functionality.

Create a new service file (`/etc/systemd/system/hello-node.service`) with the following contents:
```
[Unit]
Description=Hello Node Test App
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/hello-node/
ExecStart=/usr/bin/node app.js

[Install]
WantedBy=multi-user.target
```

Set service permissions:  
```
sudo chown root:node /etc/systemd/system/hello-node.service
sudo chmod 755 /etc/systemd/system/hello-node.service
```

Set sudo permissions for `nodejs` group:
`sudo visudo -f /etc/sudoers.d/hello-node`

File contents:
```
Cmnd_Alias HELLONODE_CMD = /usr/bin/systemctl start hello-node.service,/usr/bin/systemctl stop hello-node.service,/usr/bin/systemctl restart hello-node.service
%nodejs ALL=(ALL) NOPASSWD: HELLONODE_CMD
```

You may need to logout/restart to refresh these permissions.

Afterwards, the bot will be able to run commands like `sudo systemctl start hello-node.service` without a password prompt.

For more detailed information, please see the `examples/` directory for this project.

## Docker
The user/group running this bot should have permission to run docker without `sudo`.

To set this up, create a new docker group and assign to the designated bot user:  
```
sudo addgroup --system docker
sudo adduser node docker
newgrp docker
sudo snap disable docker
sudo snap enable docker
```


# Usage
Update `token-config.json` with your application and server tokens and update `bot-config.json` with the servers and actions.

Deploying commands:  
`node deploy-commands.js`

Run the bot:  
`node index.js`

For more detailed information, please see the `examples/` directory for this project.

&nbsp;
