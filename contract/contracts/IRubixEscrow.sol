// SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

interface IRubixEscrow {
    function addFunds(address owner, uint256 amount) external;

    function pay(address target, uint256 amount) external;

    function getCurrencyAddress() external view returns (address);
}
