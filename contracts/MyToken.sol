// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev ERC-20 토큰 컨트랙트 - NFT 마켓플레이스 거래용
 * 누구나 1회 1000 MTK를 무료로 받을 수 있는 토큰 드랍 기능 포함
 */
contract MyToken is ERC20, Ownable {
    // 토큰 드랍 금액 (1000 MTK = 1000 * 10^18)
    uint256 public constant CLAIM_AMOUNT = 1000 * 10**18;
    
    // 이미 토큰을 받은 주소 추적
    mapping(address => bool) public hasClaimed;
    
    // 토큰 드랍 이벤트
    event TokensClaimed(address indexed claimer, uint256 amount);
    
    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {
        // 컨트랙트 배포자에게 초기 공급량 발행 (1,000,000 MTK)
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    /**
     * @dev 토큰 드랍 함수 - 1인당 1회만 1000 MTK 무료 수령 가능
     */
    function claimTokens() external {
        require(!hasClaimed[msg.sender], "Already claimed tokens");
        require(balanceOf(owner()) >= CLAIM_AMOUNT, "Insufficient tokens in contract");
        
        hasClaimed[msg.sender] = true;
        _transfer(owner(), msg.sender, CLAIM_AMOUNT);
        
        emit TokensClaimed(msg.sender, CLAIM_AMOUNT);
    }
    
    /**
     * @dev 특정 주소의 토큰 수령 여부 확인
     */
    function hasClaimedTokens(address account) external view returns (bool) {
        return hasClaimed[account];
    }
    
    /**
     * @dev 소유자가 추가 토큰 발행 가능 (필요시)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}