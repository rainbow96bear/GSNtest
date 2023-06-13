// SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

interface IERC20 {
    function transfer(address _to, uint256 _value) external returns (bool);

    function transferFrom(address owner, address spender, uint256 amount) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function decimals() external returns (uint8);
}
