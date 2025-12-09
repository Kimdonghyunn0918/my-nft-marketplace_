const hre = require("hardhat");

async function main() {
    console.log("Starting deployment...\n");

    // 1. MyToken (ERC-20) 배포
    console.log("Deploying MyToken...");
    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy();
    await myToken.waitForDeployment();
    const tokenAddress = await myToken.getAddress();
    console.log(`✅ MyToken deployed to: ${tokenAddress}\n`);

    // 2. MyNFT (ERC-721) 배포
    console.log("Deploying MyNFT...");
    const MyNFT = await hre.ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy();
    await myNFT.waitForDeployment();
    const nftAddress = await myNFT.getAddress();
    console.log(`✅ MyNFT deployed to: ${nftAddress}\n`);

    // 3. NFTMarketplace 배포
    console.log("Deploying NFTMarketplace...");
    const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
    const marketplace = await NFTMarketplace.deploy(nftAddress, tokenAddress);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log(`✅ NFTMarketplace deployed to: ${marketplaceAddress}\n`);

    // 배포 정보 출력
    console.log("=".repeat(60));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`MyToken (ERC-20):       ${tokenAddress}`);
    console.log(`MyNFT (ERC-721):        ${nftAddress}`);
    console.log(`NFTMarketplace:         ${marketplaceAddress}`);
    console.log("=".repeat(60));
    console.log("\n🔥 Copy these addresses to your frontend config!\n");

    // src/lib/contracts.ts 파일용 설정 출력
    console.log("Add to src/lib/contracts.ts:");
    console.log(`
export const CONTRACT_ADDRESSES = {
  TOKEN: '${tokenAddress}',
  NFT: '${nftAddress}',
  MARKETPLACE: '${marketplaceAddress}'
} as const;
  `);

    // Verification 명령어 출력 (Etherscan)
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("\nTo verify contracts on Etherscan:");
        console.log(`npx hardhat verify --network ${hre.network.name} ${tokenAddress}`);
        console.log(`npx hardhat verify --network ${hre.network.name} ${nftAddress}`);
        console.log(`npx hardhat verify --network ${hre.network.name} ${marketplaceAddress} ${nftAddress} ${tokenAddress}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });