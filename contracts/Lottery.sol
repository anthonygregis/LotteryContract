// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract Lottery {
  address public manager;
  address[] public players;

  event playerEntered(address indexed _from, uint _value);
  event winnerPicked(address indexed winner, uint pot);

  modifier minEther() {
    require(msg.value > .01 ether, "Send more then .01 ether");
    _;
  }

  modifier isManager() {
    require(msg.sender == manager, "Must be manager of contract");
    _;
  }

  constructor () {
    manager = msg.sender;
  }

  function getPlayers() public view returns (address[] memory) {
    return players;
  }

  function enter() public payable minEther {
    players.push(msg.sender);
    emit playerEntered(msg.sender, msg.value);
  }

  // BAD - Anyone can figure out how your random function selects its number and exploit this
  function random() private view returns (uint) {
    return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
  }

  function pickWinner() public payable isManager {
    uint index = random() % players.length;
    address payable winner = payable(players[index]);
    uint pot = address(this).balance;

    winner.transfer(pot);
    emit winnerPicked(winner, pot);
  }
}