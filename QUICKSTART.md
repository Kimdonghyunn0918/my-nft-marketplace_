# 🚀 NFT Marketplace 빠른 시작 가이드

## 📋 체크리스트

시작하기 전에 다음을 준비하세요:

- [ ] Node.js 18+ 설치
- [ ] Git 설치
- [ ] MetaMask 브라우저 확장 설치
- [ ] GitHub 계정
- [ ] Vercel 계정 (무료)

---

## ⚡ 5분 만에 배포하기

### 1단계: 프로젝트 설정 (1분)

```bash
# 저장소 클론
git clone https://github.com/Kimdonghyunn0918/my-nft-marketplace.git
cd my-nft-marketplace

# 의존성 설치
npm install
```

### 2단계: 환경 변수 설정 (2분)

#### 2-1. WalletConnect Project ID 받기
1. https://cloud.walletconnect.com/ 접속
2. 무료 계정 생성
3. 새 프로젝트 생성
4. Project ID 복사

#### 2-2. Alchemy API Key 받기
1. https://www.alchemy.com/ 접속
2. 무료 계정 생성
3. "Create App" 클릭
4. Network: Ethereum, Chain: Sepolia 선택
5. API Key 복사

#### 2-3. .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일 생성:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=여기에_Project_ID
PRIVATE_KEY=여기에_메타마스크_Private_Key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/여기에_API_Key
```

**Private Key 가져오기:**
1. MetaMask 열기
2. 계정 세부정보 클릭
3. "개인 키 내보내기" 클릭
4. ⚠️ **절대 다른 사람과 공유하지 마세요!**

### 3단계: 컨트랙트 배포 (1분)

```bash
# 컴파일
npx hardhat compile

# Sepolia 테스트넷에 배포
npx hardhat run scripts/deploy.js --network sepolia
```

배포 후 출력된 주소들을 복사하세요:
```
MyToken (ERC-20):       0xABC...
MyNFT (ERC-721):        0xDEF...
NFTMarketplace:         0xGHI...
```

### 4단계: 컨트랙트 주소 업데이트 (30초)

`src/lib/contracts.ts` 파일을 열고 주소를 업데이트:

```typescript
export const CONTRACT_ADDRESSES = {
  TOKEN: '0xABC...', // 여기에 MyToken 주소
  NFT: '0xDEF...',   // 여기에 MyNFT 주소
  MARKETPLACE: '0xGHI...' // 여기에 Marketplace 주소
} as const;
```

### 5단계: 로컬에서 테스트 (30초)

```bash
npm run dev
```

http://localhost:3000 에서 확인!

---

## 🌐 Vercel에 배포하기

### 1단계: GitHub에 푸시

```bash
git add .
git commit -m "Update contract addresses"
git push origin main
```

### 2단계: Vercel 배포

1. https://vercel.com/ 접속
2. "Import Project" 클릭
3. GitHub 저장소 선택
4. Environment Variables 추가:
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: 여러분의 Project ID
5. "Deploy" 클릭!

### 3단계: 배포 완료 ✅

몇 분 후 배포가 완료되면 URL이 제공됩니다:
- 예: `https://my-nft-marketplace-eta.vercel.app`

---

## 🎯 테스트하기

### 1. Sepolia 테스트넷 ETH 받기

다음 Faucet에서 무료로 받으세요:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

약 0.5 ETH면 충분합니다!

### 2. MetaMask 네트워크 추가

1. MetaMask 열기
2. 네트워크 선택 → "네트워크 추가"
3. Sepolia 검색 후 추가

### 3. 기능 테스트

#### ✅ 토큰 받기
1. 홈 페이지 접속
2. 지갑 연결
3. "무료로 토큰 받기" 클릭
4. 1000 MTK 수령 확인

#### ✅ NFT 민팅
1. "NFT 민팅" 페이지 이동
2. 이미지 URL 입력 (예: https://picsum.photos/400)
3. 이름과 설명 입력
4. "NFT 민팅하기" 클릭

#### ✅ NFT 판매
1. "내 NFT" 페이지 이동
2. 민팅한 NFT 확인
3. 가격 입력 (예: 100)
4. "판매 등록" 클릭

#### ✅ NFT 구매
1. 다른 계정으로 로그인
2. "마켓플레이스" 페이지 이동
3. 판매 중인 NFT 확인
4. "구매하기" 클릭

---

## 🐛 문제 해결

### 문제: "Insufficient funds" 오류
**해결**: Sepolia Faucet에서 테스트넷 ETH 받기

### 문제: 트랜잭션이 오래 걸림
**해결**: 가스비를 높여서 다시 시도

### 문제: 지갑 연결 안됨
**해결**: 
1. MetaMask 재시작
2. 브라우저 새로고침
3. Sepolia 네트워크로 변경 확인

### 문제: "Already claimed" 오류
**해결**: 다른 지갑 주소로 시도 (1인 1회 제한)

### 문제: Vercel 빌드 실패
**해결**:
```bash
# 로컬에서 먼저 빌드 테스트
npm run build

# 문제 없으면 다시 푸시
git push origin main
```

---

## 📝 다음 단계

축하합니다! 🎉 NFT Marketplace가 성공적으로 배포되었습니다.

### 추가로 해볼 만한 것들:

1. **실제 이미지 업로드**
   - Pinata 연동
   - IPFS 사용

2. **기능 확장**
   - 경매 시스템
   - 좋아요 기능
   - 댓글 기능

3. **디자인 개선**
   - 커스텀 테마
   - 애니메이션 추가
   - 다크/라이트 모드

4. **성능 최적화**
   - 이미지 최적화
   - 로딩 속도 개선
   - SEO 최적화

---

## 📞 도움이 필요하신가요?

- GitHub Issues: https://github.com/Kimdonghyunn0918/my-nft-marketplace/issues
- Email: [your-email@example.com]

---

**Happy Coding! 🚀**