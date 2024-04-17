#!/bin/bash

# Run as root

# node.js 21 installation
cd ~
curl -sL https://deb.nodesource.com/setup_21.x -o nodesource_setup.sh
bash nodesource_setup.sh
apt install nodejs -y

# TODO: docker install

# node user/group
addgroup --system nodejs
adduser node
usermod -aG nodejs node

# docker group
addgroup --system docker
adduser node docker
#newgrp docker
#sudo snap disable docker
#sudo snap enable docker

# install bot
mkdir /opt/discord-bot
cd /opt/discord-bot
git clone https://github.com/robertbrestle/discord-bot-service-manager.git .
npm install
chown -R node:node /opt/discord-bot

# create bot service
echo -e "[Unit]\nDescription=Discord Bot Service Manager\nAfter=network.target\n\n[Service]\nType=simple\nUser=node\nWorkingDirectory=/opt/discord-bot/\nExecStart=/usr/bin/node index.js\n#Restart=on-failure\n\n[Install]\nWantedBy=multi-user.target\n" > /etc/systemd/system/discord-bot.service
systemctl enable discord-bot.service
systemctl daemon-reload

