# NFT Marketplace 프로젝트

ERC-20 토큰 기반 NFT 마켓플레이스 - 블록체인 수업 과제

## 🎯 프로젝트 개요

이 프로젝트는 다음 기능을 포함한 완전한 NFT 마켓플레이스입니다:

1. **ERC-20 토큰 드랍**: 누구나 1회 1000 MTK 무료 수령
2. **NFT 민팅**: 누구나 자유롭게 NFT 생성 가능
3. **NFT 거래**: MyToken(MTK)으로만 NFT 구매/판매
4. **추가 기능**: 실시간 잔액 표시, 판매 관리, 반응형 디자인

## 📁 프로젝트 구조

```
my-nft-marketplace/
├── contracts/              # Solidity 스마트 컨트랙트
│   ├── MyToken.sol        # ERC-20 토큰
│   ├── MyNFT.sol          # ERC-721 NFT
│   └── NFTMarketplace.sol # 마켓플레이스
├── scripts/               
│   └── deploy.js          # 배포 스크립트
├── src/
│   ├── app/               # Next.js 페이지
│   ├── components/        # React 컴포넌트
│   └── lib/              # 유틸리티 & 설정
└── hardhat.config.js      # Hardhat 설정
```

## 🚀 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone https://github.com/Kimdonghyunn0918/my-nft-marketplace.git
cd my-nft-marketplace
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

**WalletConnect Project ID 받기:**
- https://cloud.walletconnect.com/ 에서 무료 계정 생성
- 새 프로젝트 생성 후 Project ID 복사

**Alchemy API Key 받기:**
- https://www.alchemy.com/ 에서 무료 계정 생성
- Sepolia 테스트넷 앱 생성 후 API Key 복사

### 3. 스마트 컨트랙트 컴파일

```bash
npx hardhat compile
```

### 4. 컨트랙트 배포 (Sepolia 테스트넷)

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

배포 후 출력되는 컨트랙트 주소를 `src/lib/contracts.ts`에 업데이트:

```typescript
export const CONTRACT_ADDRESSES = {
  TOKEN: '0x...', // MyToken 주소
  NFT: '0x...', // MyNFT 주소
  MARKETPLACE: '0x...' // NFTMarketplace 주소
};
```

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

## 📦 배포 (Vercel)

### 1. GitHub에 푸시

```bash
git add .
git commit -m "Update contract addresses"
git push origin main
```

### 2. Vercel 배포

1. https://vercel.com/ 에서 GitHub 연결
2. 프로젝트 Import
3. Environment Variables 추가:
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
   - 기타 필요한 환경 변수
4. Deploy 버튼 클릭

### 3. Vercel 환경 변수 설정

Settings → Environment Variables에서 추가:

```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = your_id
```

## 🔧 문제 해결

### 일반적인 오류들

1. **"Cannot find module" 오류**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Vercel 빌드 실패**
   - Next.js 14 버전 호환성 확인
   - `next.config.ts`의 webpack 설정 확인
   - 환경 변수가 모두 설정되었는지 확인

3. **지갑 연결 안됨**
   - WalletConnect Project ID가 올바른지 확인
   - 브라우저에 MetaMask 설치 확인
   - Sepolia 테스트넷으로 네트워크 변경

4. **트랜잭션 실패**
   - Sepolia 테스트넷 ETH 확보 (Faucet 사용)
   - 가스비 부족 여부 확인
   - 컨트랙트 주소가 올바른지 확인

### Sepolia 테스트넷 ETH 받기

- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

## 🎨 주요 기능

### 1. 토큰 드랍 (홈 페이지)
- 1인 1회 1000 MTK 무료 수령
- 실시간 잔액 표시
- 중복 수령 방지

### 2. NFT 민팅
- 이미지 URL, 이름, 설명 입력
- 실시간 미리보기
- 누구나 무료로 생성 (가스비만 필요)

### 3. 마켓플레이스
- 판매 중인 NFT 목록
- MTK 토큰으로 구매
- 자동 토큰 Approve
- 2.5% 마켓플레이스 수수료

### 4. 내 NFT 관리
- 소유한 NFT 목록
- 판매 등록/취소
- 가격 설정

## 📝 스마트 컨트랙트 정보

### MyToken (ERC-20)
- **이름**: MyToken
- **심볼**: MTK
- **기능**: 토큰 드랍, 마켓플레이스 거래

### MyNFT (ERC-721)
- **이름**: MyNFT
- **심볼**: MNFT
- **기능**: NFT 민팅, 소유권 관리

### NFTMarketplace
- **수수료**: 2.5%
- **거래 토큰**: MTK만 사용
- **기능**: 판매 등록, 구매, 취소

## 🔗 배포된 컨트랙트 주소

### Sepolia 테스트넷
- **MyToken**: `0x...`
- **MyNFT**: `0x...`
- **NFTMarketplace**: `0x...`

### Etherscan 확인
- https://sepolia.etherscan.io/address/CONTRACT_ADDRESS

## 📚 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Blockchain**: Solidity, Hardhat, ethers.js
- **Wallet**: RainbowKit, Wagmi, Viem
- **Deployment**: Vercel, Sepolia Testnet

## 👨‍💻 개발자

- **이름**: 김동현
- **GitHub**: https://github.com/Kimdonghyunn0918
- **과제**: 블록체인 프로그래밍 NFT Marketplace

## 📄 라이선스

MIT License

## 🙏 참고 자료

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Hardhat Documentation](https://hardhat.org/docs)
- [RainbowKit](https://www.rainbowkit.com/)
- [Wagmi](https://wagmi.sh/)
- [Next.js](https://nextjs.org/)

---

**과제 제출일**: 2024년 12월