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

By default any user can't access that use this

```bash
sudo usermod -aG docker app
```

Now Login and Logout again.

#### In windows

[Install Docker Windows](https://docs.docker.com/desktop/install/windows-install/) and [Install Docker Conpose Windows](https://docs.docker.com/compose/install/other/)

### Install `Node JS`

We need to install `NodeJS v16.x` but default apt package of NodeJs is lower than that so enter the following command

```bash
curl -sL https://deb.nodesource.com/setup_16.x  | bash -
sudo apt install -y nodejs
```

[Official Guide](https://nodejs.dev/en/download) to Download and install.

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

1. Clone the github repo `git clone https://github.com/SPV-Network/keypair-utill.git`.
2. Change Directory to `keypair-utill` using `cd keypair-utill`.
3. Install dependencies using `npm install`.
4. Generate keys and credential using `node ./keygen.js`
5. Spin up docker instances using `docker-compose up -d`
