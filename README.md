# CP Chain Node Setup Guide

## REQUIREMENT

### System Hardware Requirement

To RUN a validator node you need a min configuration

```text
CPU: 8 cores
RAM: 16 GB and swap 200 GB
Storage: 500 GB SSD (1 TB recomended for long term)
Network: More than 100 Mbps speed
OS: Ubuntu 20.04 LTS
```

### Envioronment Requirement

For Security Purpose its recomended to add a new user and give the user `sudo access`

```bash
aduser app
usermod -aG sudo app
su - app
```

## PREQUISITES

### Update apt repository list

- Update apt repository list using `sudo apt update`.

### Install basic packages

We need to isntall following packages. Please Provide appropriate region if asked.

```bash
sudo apt-get install curl gnupg tar git software-properties-common build-essential -y
```

### Install `docker`

- Install `docker` and `docker-compose` using

```bash
sudo apt install docker-compose -y
```

- By default you can't use docker with other than root user to acheive the same you need to edit `sudo nano /lib/systemd/system/docker.service` and add `-H tcp://127.0.0.1` to `ExecStart=` line after `-H fd://` like following.

```service
[Unit]
...
...

[Service]
...
...
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://127.0.0.1 --containerd=/run/containerd/containerd.sock
...
...

[Install]
WantedBy=multi-user.target
```

- Once its done restart the docker process

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

- Once restarted the docker service we need to export DOCKER_HOST permenently by editing `nano ~/.profile` and add the following line at the end of the file

```bash
export DOCKER_HOST="tcp://127.0.0.1:2375"
```

- And finally source the file using `source ~/.profile`

### Install `Node JS`

We need to install `NodeJS v16.x` but default apt package of NodeJs is lower than that so enter the following command

```bash
curl -sL https://deb.nodesource.com/setup_16.x  | bash -
sudo apt install -y nodejs
```

## SETUP

Before you start setting up the node make sure to take some security steps activating firewall rules

```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw deny 8545
sudo ufw deny 8546
sudo ufw deny 8551
sudo ufw enable
```

To Setup a validator you will be needing one validator keypair and one deposit credentials file.

Validator keypair will be used to sign and verify blocks in the POA consensus system.

Deposit Credentials file will be used while staking through launch pool.

1. Clone the github repo `git clone https://github.com/codepartnerofficial/evm-node-setup.git`.
2. Change Directory to `evm-node-setup` using `cd evm-node-setup`.
3. Install dependencies using `npm install`.
4. Generate keys and credential using `./keygen`
5. Spin up docker instances using `docker-compose up`
