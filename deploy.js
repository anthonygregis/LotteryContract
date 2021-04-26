require("dotenv").config();
const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");
const seedPhrase = process.env.SEED_PHRASE;

const provider = new HDWalletProvider(
  seedPhrase,
  "https://rinkeby.infura.io/v3/82694c16597b4555a489f6ad05881856"
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  const newContract = await new web3.eth.Contract(interface)
    .deploy({ data: bytecode, arguments: [] })
    .send({ from: accounts[0], gas: "1000000" });

  console.log(
    "Contract Deployed:",
    `https://rinkeby.etherscan.io/address/${newContract.options.address}`
  );
};

deploy();
