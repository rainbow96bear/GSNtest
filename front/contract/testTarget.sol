pragma solidity ^0.8.7;

contract BalanceChecker {
    address owner;

    constructor(){
        owner=msg.sender;
    }
    address private constant RBX_ESCROW_WALLET = address(0x71633bE32E07dB4a645CE85418D64484B39AB692);
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    uint256 balance = 0;
    function deposit() private {
        balance += msg.value;
    }

    function withdraw(uint256 _amount) public onlyOwner{
        require(balance >= _amount, "");
        balance -= _amount;
        payable(RBX_ESCROW_WALLET).transfer(_amount);
    }

    function getBalanec()public view returns(uint256){
        return address(this).balance;
    }

    receive() external payable {
        deposit();
    }

}