// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTMarketplace
 * @dev NFT 마켓플레이스 - MyToken(ERC-20)으로만 거래 가능
 */
contract NFTMarketplace is ReentrancyGuard, Ownable {
    // 마켓플레이스 수수료 (2.5%)
    uint256 public constant FEE_PERCENT = 25; // 25 = 2.5%
    uint256 public constant FEE_DENOMINATOR = 1000;
    
    IERC721 public nftContract;
    IERC20 public tokenContract;
    
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }
    
    // tokenId => Listing
    mapping(uint256 => Listing) public listings;
    
    // 이벤트
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    
    constructor(address _nftContract, address _tokenContract) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
        tokenContract = IERC20(_tokenContract);
    }
    
    /**
     * @dev NFT를 마켓플레이스에 판매 등록
     * @param tokenId 판매할 NFT의 ID
     * @param price 판매 가격 (MyToken 단위)
     */
    function listNFT(uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be greater than 0");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(nftContract.getApproved(tokenId) == address(this), "NFT not approved");
        require(!listings[tokenId].active, "Already listed");
        
        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });
        
        emit NFTListed(tokenId, msg.sender, price);
    }
    
    /**
     * @dev NFT 구매 (MyToken으로만 결제)
     * @param tokenId 구매할 NFT의 ID
     */
    function buyNFT(uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.active, "NFT not listed");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");
        
        uint256 price = listing.price;
        uint256 fee = (price * FEE_PERCENT) / FEE_DENOMINATOR;
        uint256 sellerAmount = price - fee;
        
        // 구매자의 토큰 잔액 확인
        require(tokenContract.balanceOf(msg.sender) >= price, "Insufficient token balance");
        
        // 토큰 전송 (구매자 -> 판매자)
        require(
            tokenContract.transferFrom(msg.sender, listing.seller, sellerAmount),
            "Token transfer to seller failed"
        );
        
        // 수수료 전송 (구매자 -> 마켓플레이스 소유자)
        require(
            tokenContract.transferFrom(msg.sender, owner(), fee),
            "Fee transfer failed"
        );
        
        // NFT 전송 (판매자 -> 구매자)
        nftContract.transferFrom(listing.seller, msg.sender, tokenId);
        
        // 리스팅 비활성화
        listings[tokenId].active = false;
        
        emit NFTSold(tokenId, listing.seller, msg.sender, price);
    }
    
    /**
     * @dev 판매 등록 취소
     * @param tokenId 취소할 NFT의 ID
     */
    function cancelListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.active, "NFT not listed");
        require(listing.seller == msg.sender, "Not the seller");
        
        listings[tokenId].active = false;
        
        emit ListingCancelled(tokenId, msg.sender);
    }
    
    /**
     * @dev 특정 NFT의 판매 정보 조회
     */
    function getListing(uint256 tokenId) external view returns (
        address seller,
        uint256 price,
        bool active
    ) {
        Listing memory listing = listings[tokenId];
        return (listing.seller, listing.price, listing.active);
    }
    
    /**
     * @dev 모든 활성화된 리스팅 ID 가져오기 (View 함수)
     * 실제로는 프론트엔드에서 이벤트를 통해 추적하는 것이 효율적
     */
    function getActiveListings(uint256 maxTokenId) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // 활성화된 리스팅 개수 세기
        for (uint256 i = 1; i <= maxTokenId; i++) {
            if (listings[i].active) {
                count++;
            }
        }
        
        // 활성화된 리스팅 ID 배열 생성
        uint256[] memory activeTokenIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= maxTokenId; i++) {
            if (listings[i].active) {
                activeTokenIds[index] = i;
                index++;
            }
        }
        
        return activeTokenIds;
    }
}