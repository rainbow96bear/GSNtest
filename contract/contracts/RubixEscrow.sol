// SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {TransferHelper} from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {BasePaymaster, GsnTypes} from "@opengsn/contracts/src/BasePaymaster.sol";
import {IERC20} from "./IERC20.sol";
import "hardhat/console.sol";

contract RubixEscrow is BasePaymaster {
    mapping(address => bool) public targetWhitelist;
    mapping(address => uint256) public usedAmount;
    uint8 private constant WEI_DECIMALS = 18;
    uint256 private constant GAS_LIMIT = 1 * 10**WEI_DECIMALS;

    address private currency_address;
    IERC20 private currency_contract;

    constructor(address _currency_address) {
        currency_address = _currency_address;
        currency_contract = IERC20(_currency_address);
    }

    function getCurrencyAddress() public view returns (address) {
        return currency_address;
    }

    function versionPaymaster() external view virtual override returns (string memory) {
        return "3.0.0-beta.3+rubix.escrow.ipaymaster";
    }

    function addFunds(address owner, uint256 amount) public {
        require(amount >= 100 * 10**currency_contract.decimals(), "amount is less than 100");
        currency_contract.transferFrom(owner, address(this), amount);
        currency_contract.approve(msg.sender, amount);
        targetWhitelist[msg.sender] = true;
    }

    function _preRelayedCall(
        GsnTypes.RelayRequest calldata relayRequest,
        bytes calldata signature,
        bytes calldata approvalData,
        uint256 maxPossibleGas
    ) internal virtual override returns (bytes memory context, bool revertOnRecipientRevert) {
        (relayRequest, signature, approvalData, maxPossibleGas);

        require(targetWhitelist[relayRequest.request.to], "wrong target");
        require(
            usedAmount[relayRequest.request.from] + (maxPossibleGas * tx.gasprice) < GAS_LIMIT,
            "over the limit"
        );

        return (abi.encode(relayRequest.request.to), false);
    }

    function _postRelayedCall(
        bytes calldata context,
        bool success,
        uint256 gasUseWithoutPost,
        GsnTypes.RelayData calldata relayData
    ) internal virtual override {
        (context, success, gasUseWithoutPost, relayData);
        address projectCA = abi.decode(context, (address));
        usedAmount[projectCA] += (gasUseWithoutPost + gasleft()) * (tx.gasprice);
    }

    function getBalance() public view returns (uint256) {
        return relayHub.balanceOf(address(this));
    }

    function withdrawToEscrowWallet(uint256 amount) public onlyOwner {
        relayHub.withdraw(payable(address(this)), amount);
    }

    function decreaseUsedAmount(address _target, uint256 _amount) public onlyOwner {
        usedAmount[_target] -= _amount;
    }
}
