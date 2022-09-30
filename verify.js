import Web3 from 'web3';

let web3 = new Web3("https://ds2.exx.network");

let message = "I want to stake 20000 SPV coin to testnet from 0x254dB12ed21A515Ba0736282f6AC8C13772ad30b.";
let sign = "0x610f1256524f352ee39800b635c73228b446f8c27014565ac83acc759e23468f2800ecd4ef45d1c767e180fa02da4a25e4982adfbf6399868f87b85974c88ed21b";

let recover = web3.eth.accounts.recover(message, sign);
console.log(recover)