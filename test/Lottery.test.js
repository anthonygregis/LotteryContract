const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require("../compile");

let lottery;
let accounts;
let senderAddress;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  senderAddress = accounts[0];

  // Use one of those accounts to deploy the contract
  lottery = await new web3.eth.Contract(interface)
    .deploy({ data: bytecode })
    .send({ from: senderAddress, gas: "1000000" });
});

describe("Lottery Contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter lottery", async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });

    let players = await lottery.methods.getPlayers().call({
      from: accounts[1],
    });

    assert.strictEqual(accounts[1], players[0]);
    assert.strictEqual(1, players.length);
  });

  it("allows multiple accounts to enter lottery", async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[3],
      value: web3.utils.toWei("0.02", "ether"),
    });

    let players = await lottery.methods.getPlayers().call({
      from: accounts[1],
    });

    assert.strictEqual(accounts[1], players[0]);
    assert.strictEqual(accounts[2], players[1]);
    assert.strictEqual(accounts[3], players[2]);
    assert.strictEqual(3, players.length);
  });

  it("requires minimum amount of ether to enter", async () => {
    let executed;

    try {
      await lottery.methods.enter().send({
        from: accounts[1],
        value: 0,
      });
      executed = "Account Added";
    } catch (err) {
      executed = "Account Failed";
    }

    assert.strictEqual("Account Failed", executed);
  });

  it("Only manager can pick winner", async () => {
    let executed;

    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });
      executed = true;
    } catch (err) {
      executed = false;
    }

    assert.strictEqual(false, executed);
  });

  it("runs a full lottery", async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("2", "ether"),
    });

    const enterBalance = await web3.eth.getBalance(accounts[1]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const winningBalance = await web3.eth.getBalance(accounts[1]);
    const balanceDifference = winningBalance - enterBalance;
    const players = await lottery.methods.getPlayers().call({
      from: accounts[1],
    });

    assert(balanceDifference > web3.utils.toWei("1.8", "ether"));
    assert.strictEqual(0, players.length);
    assert.strictEqual("0", await web3.eth.getBalance(lottery.options.address));
  });
});
