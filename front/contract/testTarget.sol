pragma solidity ^0.8.7;
import "@opengsn/contracts/src/ERC2771Recipient.sol";
contract testTarget is ERC2771Recipient {
    uint256 testNumber = 0;
    constructor(address forwarder) {
        _setTrustedForwarder(forwarder);
    }
    function up() public {
        testNumber+=1;
    }
    function down() public {
        testNumber-=1;
    }
    function getNumber() public returns(uint256){
        return testNumber;
    }
}

