//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;
import "@opengsn/contracts/src/BasePaymaster.sol";
// accept everything.
// this paymaster accepts any request.
//
// NOTE: Do NOT use this contract on a mainnet: it accepts anything, so anyone can "grief" it and drain its account

contract TestSinglePaymaster is BasePaymaster {
    
    mapping(address => bool) public targetWhitelist;

    uint256 initialLimit = 10**18;

    struct Info {
        uint256 GasLimit;
        uint256 usedAmount;
    }

    mapping(address => Info) public userInfo;

    address from;

    function versionPaymaster() external view override virtual returns (string memory){
        return "3.0.0-beta.3+opengsn.accepteverything.ipaymaster";
    }
    
    function _preRelayedCall(
        GsnTypes.RelayRequest calldata relayRequest,
        bytes calldata signature,
        bytes calldata approvalData,
        uint256 maxPossibleGas
    )
    internal
    override
    virtual
    returns (bytes memory context, bool revertOnRecipientRevert) {
        (relayRequest, signature, approvalData, maxPossibleGas);
                require(targetWhitelist[relayRequest.request.to], "wrong target");
        uint256 gas = gasleft();
        from = relayRequest.request.from;
        if (userInfo[from].GasLimit == 0) {
            userInfo[from].GasLimit = initialLimit;
        }
        require(userInfo[from].usedAmount+(gasleft()*tx.gasprice)<userInfo[from].GasLimit,"over the limit");
        return ("", false);
    }

    function _postRelayedCall(
        bytes calldata context,
        bool success,
        uint256 gasUseWithoutPost,
        GsnTypes.RelayData calldata relayData
    )
    internal
    override
    virtual {
        (context, success, gasUseWithoutPost, relayData);
        userInfo[from].usedAmount+= (gasUseWithoutPost+gasleft())*(tx.gasprice);
    }
    
    function withdraw(uint256 amount, address payable target) public onlyOwner {
        relayHub.withdraw(target,amount);
    }

    function whitelistTarget(address target, bool isAllowed) public onlyOwner {
        targetWhitelist[target] = isAllowed;
    }

    function getBalance() public view returns (uint256) {
        return relayHub.balanceOf(address(this));
    }

    function increaseLimit(address _target,uint256 _amount) public onlyOwner{
        userInfo[_target].GasLimit += _amount;
    }

    function decreaseUesdAmount(address _target,uint256 _amount) public onlyOwner{
        userInfo[_target].usedAmount -= _amount;
    }
}