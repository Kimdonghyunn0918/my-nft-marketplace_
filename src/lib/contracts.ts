export const CONTRACT_ADDRESSES = {
    TOKEN: '0x...', // MyToken 주소
    NFT: '0x...', // MyNFT 주소
    MARKETPLACE: '0x...' // NFTMarketplace 주소
} as const;

export const TOKEN_ABI = [
    "function claimTokens() external",
    "function hasClaimed(address) view returns (bool)",
    "function balanceOf(address) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "event TokensClaimed(address indexed claimer, uint256 amount)"
] as const;

export const NFT_ABI = [
    "function mintNFT(string memory tokenURI) external returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function approve(address to, uint256 tokenId)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)",
    "function tokensOfOwner(address owner) view returns (uint256[])",
    "function getTotalSupply() view returns (uint256)",
    "event NFTMinted(address indexed minter, uint256 indexed tokenId, string tokenURI)"
] as const;

export const MARKETPLACE_ABI = [
    "function listNFT(uint256 tokenId, uint256 price) external",
    "function buyNFT(uint256 tokenId) external",
    "function cancelListing(uint256 tokenId) external",
    "function getListing(uint256 tokenId) view returns (address seller, uint256 price, bool active)",
    "function getActiveListings(uint256 maxTokenId) view returns (uint256[])",
    "event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price)",
    "event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)",
    "event ListingCancelled(uint256 indexed tokenId, address indexed seller)"
] as const;

export const formatTokenAmount = (amount: bigint): string => {
    return (Number(amount) / 10 ** 18).toFixed(2);
};

export const parseTokenAmount = (amount: string): bigint => {
    return BigInt(Math.floor(parseFloat(amount) * 10 ** 18));
};