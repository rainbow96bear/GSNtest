// SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "hardhat/console.sol";

contract SampleToken is ERC20, ERC20Permit {
    constructor() ERC20("SampleToken", "SMT") ERC20Permit("SampleToken") {
        _mint(address(0xBA7c3C5Ee535363D81ec161Dd4d532C0d4a5357C), 100 * 10 ** decimals());
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
