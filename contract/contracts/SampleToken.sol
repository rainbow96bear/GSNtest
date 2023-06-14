// SPDX-License-Identifier:MIT
pragma solidity ^0.8.8;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract SampleToken is ERC20, ERC20Permit {
    constructor() ERC20("SampleToken", "SMT") ERC20Permit("SampleToken") {
        _mint(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266), 1000000 * 10 ** decimals());
        _mint(address(0x71633bE32E07dB4a645CE85418D64484B39AB692), 1000000 * 10 ** decimals());
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }
}