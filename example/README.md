# Quickstart Guide and Examples
This guide will walk you through configuring your environment deploying the bot.

For reference, bot was developed using Node.js 21 and Ubuntu 22.04.

# Install Node.js
To install Node.js 21 on Ubuntu:  
```
cd ~
curl -sL https://deb.nodesource.com/setup_21.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt install nodejs -y
```

Check to see if it installed correctly:  
```
node -v
npm -v
```

# Create user and group
For security, create a new group `nodejs` and user `node` to run this bot.

Create `nodejs` group:  
```
sudo addgroup --system nodejs
```

Create `node` user:  
```
sudo adduser node
sudo usermod -aG nodejs node
```

Add `node` user to the `docker` group if intending to use the container management functionality:  
```
sudo usermod -aG docker node
```

# Install this bot
```
mkdir /opt/discord-bot
cd /opt/discord-bot
git clone https://github.com/robertbrestle/discord-bot-service-manager.git .
npm install
chown -R node:node /opt/discord-bot
```

Update configuration files as specified in the root README with your application and server settings.

Deploy commands:  
`node deploy-commands.js`

Run the bot:  
`node index.js`

If the commands deployed to your server and you can interact with the bot, the bot successfully installed! You can exit the bot and move on to creating a startup service.

# Install systemd service
Create the following service file to run the bot:  
`/etc/systemd/system/discord-bot.service`

```
[Unit]
Description=Discord Bot Service Manager
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/discord-bot/
ExecStart=/usr/bin/node index.js
#Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Attempt to run the service and ensure it starts without errors:  
`sudo systemctl start discord-bot.service`

Enable the service to run on startup:  
```
sudo systemctl enable discord-bot.service
sudo systemctl daemon-reload
```

# docker container example
TODO

# systemd service example
TODO

&nbsp;
