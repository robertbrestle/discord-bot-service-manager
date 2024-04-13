# discord-bot-service-manager
This discord.js bot is designed to manage systemd services and docker containers running on its host machine.

**DO NOT RUN THIS BOT AS ROOT!**

# Setup
For initial setup, make sure `token-config.json` contains the correct bot and server information.

## Services
To ensure a higher level of security, create a new user and group to run the bot and assign services to them. This prevents the need to run the bot as root while providing all of the functionality.

Create a new service file (`/etc/systemd/system/hello-node.service`) with the following contents:
```
[Unit]
Description=Hello Node Test App
After=network.target

[Service]
Type=simple
User=test
WorkingDirectory=/opt/hello-node/
ExecStart=/usr/bin/node app.js

[Install]
WantedBy=multi-user.target
```

Set service permissions
```
sudo chown root:node /etc/systemd/system/hello-node.service
sudo chmod 755 /etc/systemd/system/hello-node.service
```

Set sudo permissions for `node` group:
`sudo visudo -f /etc/sudoers.d/hello-node`

File contents:
```
Cmnd_Alias HELLONODE_CMD = /usr/bin/systemctl start hello-node.service,/usr/bin/systemctl stop hello-node.service,/usr/bin/systemctl restart hello-node.service
%node ALL=(ALL) NOPASSWD: HELLONODE_CMD
```

You may need to logout/restart to refresh these permissions.

Afterwards, the bot will be able to run commands like `sudo systemctl start hello-node.service` without a password prompt.

## Docker

Create a new docker group and assign to the designated bot user:
```
sudo addgroup --system docker
sudo adduser $USER docker
newgrp docker
sudo snap disable docker
sudo snap enable docker
```


# Usage
Update `token-config.json` with your bot tokens and server identifier before running this bot.

Deploying commands:
`node deploy-commands.js`

Run bot:
`node index.js`

&nbsp;
