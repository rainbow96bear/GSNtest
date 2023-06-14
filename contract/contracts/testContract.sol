// SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

contract testContract {

    address public lead;

    function hireLeader(address _lead)external{
        lead= _lead;
    }
    function fireLeader(address _lead)external{
        lead = address(0);
    }

}
