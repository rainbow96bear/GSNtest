//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@opengsn/contracts/src/BasePaymaster.sol";

// accept everything.
// this paymaster accepts any request.
//
// NOTE: Do NOT use this contract on a mainnet: it accepts anything, so anyone can "grief" it and drain its account

contract TestSinglePaymaster is BasePaymaster {
    uint256 balance = 0;
    address public target;

    function versionPaymaster() external view override virtual returns (string memory){
        return "3.0.0-beta.3+opengsn.accepteverything.ipaymaster";
    }
    event TargetChanged(address oldTarget, address newTarget);
    function setTarget(address _target) external onlyOwner {
        emit TargetChanged(target, _target);
        target=_target;
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
        require(relayRequest.request.to==target, "wrong target");
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
    }
    function getBalance()public view returns(uint256){
       return relayHub.balanceOf(address(this));
    }
}