// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract Array {
  uint[] public myArray;

  constructor () {
    myArray.push(1);
    myArray.push(2);
    myArray.push(4);
    myArray.push(16);
  }

  function getArrayLength() public view returns (uint) {
    return myArray.length;
  }
}