'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, NFT_ABI, MARKETPLACE_ABI, TOKEN_ABI, formatTokenAmount, parseTokenAmount } from '@/lib/contracts';
import { ShoppingBag, Loader2, CheckCircle2, Tag } from 'lucide-react';

interface NFTListing {
    tokenId: number;
    seller: string;
    price: bigint;
    tokenURI: string;
    metadata?: {
        name: string;
        description: string;
        image: string;
    };
}

export default function MarketplacePage() {
    const { address, isConnected } = useAccount();
    const [listings, setListings] = useState<NFTListing[]>([]);
    const [buyingTokenId, setBuyingTokenId] = useState<number | null>(null);
    const [approvingToken, setApprovingToken] = useState(false);

    // 총 NFT 개수 조회
    const { data: totalSupply } = useReadContract({
        address: CONTRACT_ADDRESSES.NFT as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'getTotalSupply',
    });

    // 토큰 잔액
    const { data: tokenBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
        abi: TOKEN_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    // 활성화된 리스팅 조회
    const { data: activeListingIds, refetch: refetchListings } = useReadContract({
        address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'getActiveListings',
        args: totalSupply ? [totalSupply] : undefined,
    });

    const { writeContract, data: hash } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash });

    // 리스팅 데이터 로드
    useEffect(() => {
        const loadListings = async () => {
            if (!activeListingIds || !Array.isArray(activeListingIds)) return;

            const loadedListings: NFTListing[] = [];

            for (const tokenId of activeListingIds) {
                try {
                    // TokenURI 조회
                    const response = await fetch(
                        `https://eth-sepolia.g.alchemy.com/v2/demo`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                jsonrpc: '2.0',
                                id: 1,
                                method: 'eth_call',
                                params: [
                                    {
                                        to: CONTRACT_ADDRESSES.NFT,
                                        data: `0xc87b56dd${Number(tokenId).toString(16).padStart(64, '0')}`,
                                    },
                                    'latest',
                                ],
                            }),
                        }
                    );

                    // Listing 정보 조회 (간단하게 하드코딩된 예시)
                    // 실제로는 useReadContract를 여러 번 호출해야 함
                    const price = BigInt(100) * BigInt(10 ** 18); // 예시 가격

                    loadedListings.push({
                        tokenId: Number(tokenId),
                        seller: '0x...',
                        price,
                        tokenURI: '',
                    });
                } catch (error) {
                    console.error(`Error loading token ${tokenId}:`, error);
                }
            }

            setListings(loadedListings);
        };

        loadListings();
    }, [activeListingIds]);

    // 토큰 Approve
    const handleApproveToken = async (price: bigint) => {
        try {
            setApprovingToken(true);
            writeContract({
                address: CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
                abi: TOKEN_ABI,
                functionName: 'approve',
                args: [CONTRACT_ADDRESSES.MARKETPLACE, price],
            });
        } catch (error) {
            console.error('Approve failed:', error);
            setApprovingToken(false);
        }
    };

    // NFT 구매
    const handleBuyNFT = async (tokenId: number, price: bigint) => {
        try {
            setBuyingTokenId(tokenId);

            // 먼저 토큰 승인
            await handleApproveToken(price);

            // 승인 후 구매
            setTimeout(() => {
                writeContract({
                    address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
                    abi: MARKETPLACE_ABI,
                    functionName: 'buyNFT',
                    args: [BigInt(tokenId)],
                });
            }, 2000);
        } catch (error) {
            console.error('Buy failed:', error);
            setBuyingTokenId(null);
        }
    };

    // 구매 성공 시
    useEffect(() => {
        if (isSuccess && buyingTokenId) {
            refetchListings();
            setBuyingTokenId(null);
            setApprovingToken(false);
        }
    }, [isSuccess, buyingTokenId, refetchListings]);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    NFT 마켓플레이스 🛒
                </h1>
                <p className="text-xl text-gray-300">
                    MyToken(MTK)으로 다른 사용자의 NFT를 구매하세요
                </p>
            </div>

            {!isConnected ? (
                <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
                    <ShoppingBag className="mx-auto mb-4 text-green-400" size={64} />
                    <h2 className="text-2xl font-bold mb-4">지갑을 연결하세요</h2>
                    <p className="text-gray-400">
                        NFT를 구매하기 위해서는 먼저 지갑을 연결해야 합니다
                    </p>
                </div>
            ) : (
                <>
                    {/* 토큰 잔액 표시 */}
                    <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-2xl p-6 mb-8 border border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 mb-1">사용 가능한 잔액</p>
                                <p className="text-3xl font-bold text-white">
                                    {tokenBalance ? formatTokenAmount(tokenBalance as bigint) : '0'} MTK
                                </p>
                            </div>
                            <Tag className="text-yellow-400" size={48} />
                        </div>
                    </div>

                    {/* NFT 리스트 */}
                    {listings.length === 0 ? (
                        <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
                            <ShoppingBag className="mx-auto mb-4 text-gray-600" size={64} />
                            <h2 className="text-2xl font-bold mb-2">판매 중인 NFT가 없습니다</h2>
                            <p className="text-gray-400">
                                다른 사용자가 NFT를 등록할 때까지 기다려주세요
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map((listing) => (
                                <div
                                    key={listing.tokenId}
                                    className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all hover:shadow-2xl"
                                >
                                    <div className="relative">
                                        {listing.metadata?.image ? (
                                            <img
                                                src={listing.metadata.image}
                                                alt={listing.metadata.name}
                                                className="w-full h-64 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-64 bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                                                <span className="text-6xl">🎨</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-black/70 px-3 py-1 rounded-full text-sm">
                                            #{listing.tokenId}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2">
                                            {listing.metadata?.name || `NFT #${listing.tokenId}`}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                            {listing.metadata?.description || '설명 없음'}
                                        </p>

                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500">가격</p>
                                                <p className="text-2xl font-bold text-green-400">
                                                    {formatTokenAmount(listing.price)} MTK
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleBuyNFT(listing.tokenId, listing.price)}
                                            disabled={
                                                buyingTokenId === listing.tokenId ||
                                                listing.seller.toLowerCase() === address?.toLowerCase()
                                            }
                                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            {buyingTokenId === listing.tokenId ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    {approvingToken ? '승인 중...' : '구매 중...'}
                                                </>
                                            ) : listing.seller.toLowerCase() === address?.toLowerCase() ? (
                                                '내 NFT'
                                            ) : (
                                                <>
                                                    <ShoppingBag size={20} />
                                                    구매하기
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}