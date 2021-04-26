const path = require("path");
const fs = require("fs");
const solc = require("solc");
const { exit } = require("process");

const contractPath = path.resolve(__dirname, "contracts");
const fileNames = fs.readdirSync(contractPath);

const input = {
  language: "Solidity",
  sources: fileNames.reduce((input, fileName) => {
    const filePath = path.resolve(contractPath, fileName);
    const source = fs.readFileSync(filePath, "utf8");
    return { ...input, [fileName]: { content: source } };
  }, {}),
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  output.errors.forEach((err) => {
    console.error(err.formattedMessage);
  });
  exit(1);
} else {
  var contract = output.contracts["Lottery.sol"].Lottery;
  var bytecode = contract.evm.bytecode.object;
  var interface = contract.abi;

  module.exports = { interface, bytecode };
}
