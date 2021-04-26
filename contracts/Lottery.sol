// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract Lottery {
  address public manager;
  address[] public players;

  modifier minEther() {
    require(msg.value > .01 ether, "Send more then .01 ether");
    _;
  }

  event playerEntered(address indexed _from, uint _value);

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
}