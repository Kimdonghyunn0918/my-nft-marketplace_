// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    uint256 public constant CLAIM_AMOUNT = 1000 * 10**18;
    mapping(address => bool) public hasClaimed;
    
    event TokensClaimed(address indexed claimer, uint256 amount);
    
    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function claimTokens() external {
        require(!hasClaimed[msg.sender], "Already claimed tokens");
        require(balanceOf(owner()) >= CLAIM_AMOUNT, "Insufficient tokens in contract");
        
        hasClaimed[msg.sender] = true;
        _transfer(owner(), msg.sender, CLAIM_AMOUNT);
        
        emit TokensClaimed(msg.sender, CLAIM_AMOUNT);
    }
    
    function hasClaimedTokens(address account) external view returns (bool) {
        return hasClaimed[account];
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}