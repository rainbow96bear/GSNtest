// SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

import {ERC2771Recipient} from "@opengsn/contracts/src/ERC2771Recipient.sol";

contract testContract is ERC2771Recipient {

    constructor() {
        _setTrustedForwarder(0xB2b5841DBeF766d4b521221732F9B618fCf34A87 );
    }
    address public lead;

    function hireLeader(address _lead)external{
        lead= _lead;
    }
    function fireLeader(address _lead)external{
        lead = address(0);
    }

}
