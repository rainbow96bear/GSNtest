// SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

// 1. Client create a project, and send budget (USDC) to escrow
// 2. Client pays the gas fee
// 3. Client calls the backend that project is created.
// 4. Backend permits the contract to spend the budget from escrow

// 5. Client --> Relay --> assigns a leader
// 6. Leader --> Relay --> create tasks
// 7. Leader --> Relay --> assign tasks to workers
// 8. Worker --> Relay --> start task
// 9. Worker --> Relay --> complete task
// 10. Leader --> Relay --> review task
// 11. Leader --> Relay --> complete project
// 12. Client --> Relay --> review project
// 13. Client --> Relay --> pay the remaining budget to leader

import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {TransferHelper} from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {BasePaymaster, GsnTypes} from "@opengsn/contracts/src/BasePaymaster.sol";
import {IERC20} from "./IERC20.sol";
import "hardhat/console.sol";

contract RubixEscrow is BasePaymaster {
    mapping(address => bool) public targetWhitelist;
    mapping(address => uint256) public usedAmount;
    uint8 private constant GWEI_DECIMALS = 9;
    uint256 private constant GAS_LIMIT = 1 * 10 ** GWEI_DECIMALS;

    address private constant USDC_ADDRESS = address(0x5FbDB2315678afecb367f032d93F642f64180aa3);
    IERC20 private constant USDC = IERC20(USDC_ADDRESS);

    function versionPaymaster() external view virtual override returns (string memory) {
        return "1.0.0+rubix.paymaster";
    }

    function addFunds(address owner, uint256 amount) public {
        require(amount >= 100 * 10 ** USDC.decimals(), "amount is less than 100");
        USDC.transferFrom(owner, address(this), amount);
        USDC.approve(msg.sender, amount);
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
