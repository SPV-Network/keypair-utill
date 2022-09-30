#!/usr/bin/env node
// var Wallet = require('ethereumjs-wallet');
// const fs = require('fs');
// const path = require('path');
// var key = Buffer.from('14df3a7280bc4d2f6e89ba9e41cfdc7f004dd5266c6491b26ddf7739c1f539b9', 'hex');
// var wallet = Wallet.default.fromPrivateKey(key)
// let password = '12345678'
// let content = wallet.toV3String(password);
// const date = new Date();
// // UTC--2021-11-16T09-44-31.306670631Z--00c98e68c37ed3af09d34f962a21e909714e6d681
// content.then(data=>{
//     let filename = 'UTC--'+date.toISOString();
//     filename = filename.replace(':','-').replace(':','-').slice(0,24)+'.306670631Z'+'--'+JSON.parse(data).address;
//     // console.log(filename);
//     // 
//     fs.writeFileSync(path.join(__dirname,'blockchain','.ethereum','keystore',filename),data)
//     fs.writeFileSync(path.join(__dirname,'blockchain/start.sh'),"geth --config /app/config2.toml --mine --unlock 0x"+JSON.parse(data).address+" --password /app/password.txt --http --ws --allow-insecure-unlock")
//     fs.writeFileSync(path.join(__dirname,'blockchain/password.txt'),password);
// })

import inquirer from 'inquirer';
import Wallet from 'ethereumjs-wallet';
import bip39 from 'bip39';
import hdkey from 'hdkey';
import ethUtil from 'ethereumjs-util';
import fs from 'fs';
import path from 'path';
import Web3 from 'web3';
import { setTimeout } from 'timers/promises';
import { BigNumber} from 'bignumber.js'
const __dirname = path.resolve();

let web3 = new Web3("https://ds2.exx.network");


//function for generate mnemonic
async function generateMnemonic(){
  console.log("Please wait Generating new seed")
  await setTimeout(2000); //wait for 2 seconds
  let mnemonic = bip39.generateMnemonic();
  console.log(mnemonic)
  console.log(".......Store this seed is a secure place.......");
  await setTimeout(2000); //wait for 2 seconds
  return mnemonic;
}

//generate public private key of address
async function walletfromMnemonic(userInput){
  console.log("......we are using first address to generate stuff")
  let mnemonic = userInput
  let seed = await bip39.mnemonicToSeed(mnemonic);
  let root = hdkey.fromMasterSeed(seed);
  let masterPrivateKey = root.privateKey.toString('hex');
  let addrNode = root.derive("m/44'/60'/0'/0/0");
  let pubKey = ethUtil.privateToPublic(addrNode._privateKey);
  let privateKey = addrNode._privateKey.toString('hex');
  let addr = "0x"+ethUtil.publicToAddress(pubKey).toString('hex');
  let address = ethUtil.toChecksumAddress(addr);
  // console.log("Private Key ", masterPrivateKey);
  // console.log("Public Key", address);
  return {mnemonic, privateKey, address};
}

//generate signed json file
async function generateDepositeSignature(jsonObject){
  let amountInWei = BigInt(BigNumber(jsonObject.amountStake).multipliedBy(BigNumber(10**18)).toFixed());
  let message = `I want to stake ${amountInWei.toString()} SPV coin to testnet from ${jsonObject.address.toLowerCase()}.`;
  console.log(jsonObject);
  let sign = web3.eth.accounts.sign(web3.utils.sha3(message), `0x${jsonObject.privateKey}`);
  let template = `{
  "message": "${message}",
  "amount": "${amountInWei.toString()}",
  "timestamp": ${Date.now()},
  "signature": "${sign.signature}",
  "address": "${jsonObject.address}"
}`;
  console.log(template);
  let date = new Date();
  let filename = 'UTC--'+date.toISOString();
  let wallet = Wallet.default.fromPrivateKey(Buffer.from(jsonObject.privateKey,'hex'));
  let content = await wallet.toV3String(jsonObject.password);
  //fs.writeFileSync(`${filename}.json`, template); //write json file
  filename = filename.replace(':','-').replace(':','-').slice(0,24)+'.306670631Z'+'--'+JSON.parse(content).address;
  fs.writeFileSync(path.join(__dirname,'blockchain','.ethereum','keystore',`${filename}`), content); //write json
  fs.writeFileSync(path.join(__dirname,'deposit-signature.json'), template); //write json
  fs.writeFileSync(path.join(__dirname,'blockchain','password.txt'), jsonObject.password); //write password.txt
  fs.writeFileSync(path.join(__dirname,'blockchain/start.sh'),"geth --config /app/config2.toml --mine --unlock 0x"+JSON.parse(content).address+" --password /app/password.txt --http --ws --allow-insecure-unlock")
  // web3.eth.accounts.sign("Hello World", `0x${jsonObject.privateKey}`)
  // .then(console.log);
}

//inquirer questions
const questionSetA = [
  {
      type: "list",
      name: "seedOption",
      message: "Do you have seed phrase?",
      choices: ["yes", "no"]
  },
  {
    type: "input",
    name: "mnemonicProvided",
    message: "Enter 12 keyword mnemonic",
    when(answers) {
        return answers.seedOption === "yes"
    }
  },
  {
    type: "confirm",
    name: "mnemonicGenerated",
    message: "wait",
    default: true,
    when(answers) {
        return answers.seedOption === "no"
    }
  },
]

const questionSetB = [
  {
    type: "input",
    name: "amountStake",
    message: "How much amount you want to stake?",
    default: "20000",
  },
  {
    type: "input",
    name: "password",
    message: "Enter password to secure keystore",
    when(answers){
      return answers.amountStake
    }
  },
]

//inquirer call
inquirer
.prompt(questionSetA)
.then(async (answers) => {
  let signedMessage;  //variable of store signed message properties
  if(answers.seedOption === "no"){
    let seed = await generateMnemonic();
    let wallet = await walletfromMnemonic(seed.trim());
    //answers.mnemonicGenerated = wallet;
    //console.log(wallet);
    signedMessage = wallet;
  }
  if(answers.seedOption === "yes"){
    let seed = await walletfromMnemonic((answers.mnemonicProvided).trim());
    signedMessage = seed;
    console.log("signedMessage", signedMessage);
  }
  if(answers.mnemonicGenerated === true || answers.mnemonicProvided)
  {
    inquirer
    .prompt(questionSetB)
    .then(async (answers) => {
      // console.log(JSON.stringify(answers, null, 2))
      signedMessage = {...signedMessage, ...answers}
      console.log(JSON.stringify(signedMessage, null, 2));
      let file = await generateDepositeSignature(signedMessage);
    })
  }
})
.catch((error) => {
  if (error.isTtyError) {
    console.log("Your console environment is not supported!")
  } else {
    console.log(error)
  }
})

/**
 * *****************************Zenith validator 40.76.21.62 details********************
 * {
    "mnemonic": "scissors tail vapor social ivory source original slender divert there impact toss",
    "privateKey": "d61b7b39b97984a0ec06c02aaa8bc78ce161d029e182ed38807bd1c577c2b54f",
    "address": "0x3461b3cd62f63b4783C6Cd14a711c3EFF1bFB7b2",
    "amountStake": "1",
    "password": "123456789"
  }
  {
  mnemonic: 'scissors tail vapor social ivory source original slender divert there impact toss',
  privateKey: 'd61b7b39b97984a0ec06c02aaa8bc78ce161d029e182ed38807bd1c577c2b54f',
  address: '0x3461b3cd62f63b4783C6Cd14a711c3EFF1bFB7b2',
  amountStake: '1',
  password: '123456789'
  }
  {
  "message": "I want to stake 1000000000000000000 SPV coin to testnet from 0x3461b3cd62f63b4783c6cd14a711c3eff1bfb7b2.",
  "amount": "1000000000000000000",
  "timestamp": 1662637262665,
  "signature": "0xa3e7f180b938461d3293d263c365a68a6f88702567b24efdb0a3bc584afe4011698979c1fba4847e000ec96fbce3ea595b81c2e99ee71ba41d8ea487ffa9578a1b",
  "address": "0x3461b3cd62f63b4783C6Cd14a711c3EFF1bFB7b2"
  }
 */