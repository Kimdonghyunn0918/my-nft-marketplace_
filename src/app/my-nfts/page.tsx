'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, NFT_ABI, MARKETPLACE_ABI, formatTokenAmount, parseTokenAmount } from '@/lib/contracts';
import { Home, Tag, X, Loader2, CheckCircle2 } from 'lucide-react';

interface MyNFT {
    tokenId: number;
    tokenURI: string;
    isListed: boolean;
    price?: bigint;
    metadata?: {
        name: string;
        description: string;
        image: string;
    };
}

export default function MyNFTsPage() {
    const { address, isConnected } = useAccount();
    const [myNFTs, setMyNFTs] = useState<MyNFT[]>([]);
    const [listingPrice, setListingPrice] = useState<{ [key: number]: string }>({});
    const [actioningTokenId, setActioningTokenId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<'list' | 'cancel' | null>(null);

    // 내가 소유한 NFT ID 목록
    const { data: myTokenIds, refetch: refetchMyNFTs } = useReadContract({
        address: CONTRACT_ADDRESSES.NFT as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'tokensOfOwner',
        args: address ? [address] : undefined,
    });

    const { writeContract, data: hash } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash });

    // NFT 데이터 로드
    useEffect(() => {
        const loadMyNFTs = async () => {
            if (!myTokenIds || !Array.isArray(myTokenIds)) return;

            const loadedNFTs: MyNFT[] = [];

            for (const tokenId of myTokenIds) {
                try {
                    // 여기서는 간단히 예시 데이터 사용
                    loadedNFTs.push({
                        tokenId: Number(tokenId),
                        tokenURI: '',
                        isListed: false,
                        metadata: {
                            name: `My NFT #${tokenId}`,
                            description: 'This is my NFT',
                            image: 'https://via.placeholder.com/400',
                        },
                    });
                } catch (error) {
                    console.error(`Error loading token ${tokenId}:`, error);
                }
            }

            setMyNFTs(loadedNFTs);
        };

        loadMyNFTs();
    }, [myTokenIds]);

    // NFT Approve
    const handleApproveNFT = async (tokenId: number) => {
        writeContract({
            address: CONTRACT_ADDRESSES.NFT as `0x${string}`,
            abi: NFT_ABI,
            functionName: 'approve',
            args: [CONTRACT_ADDRESSES.MARKETPLACE, BigInt(tokenId)],
        });
    };

    // NFT 판매 등록
    const handleListNFT = async (tokenId: number) => {
        const priceStr = listingPrice[tokenId];
        if (!priceStr || parseFloat(priceStr) <= 0) {
            alert('가격을 입력하세요');
            return;
        }

        try {
            setActioningTokenId(tokenId);
            setActionType('list');

            // 먼저 Approve
            await handleApproveNFT(tokenId);

            // Approve 후 리스팅
            setTimeout(() => {
                const price = parseTokenAmount(priceStr);
                writeContract({
                    address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
                    abi: MARKETPLACE_ABI,
                    functionName: 'listNFT',
                    args: [BigInt(tokenId), price],
                });
            }, 2000);
        } catch (error) {
            console.error('Listing failed:', error);
            setActioningTokenId(null);
            setActionType(null);
        }
    };

    // 판매 취소
    const handleCancelListing = async (tokenId: number) => {
        try {
            setActioningTokenId(tokenId);
            setActionType('cancel');

            writeContract({
                address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
                abi: MARKETPLACE_ABI,
                functionName: 'cancelListing',
                args: [BigInt(tokenId)],
            });
        } catch (error) {
            console.error('Cancel failed:', error);
            setActioningTokenId(null);
            setActionType(null);
        }
    };

    // 트랜잭션 성공 시
    useEffect(() => {
        if (isSuccess && actioningTokenId) {
            refetchMyNFTs();
            setActioningTokenId(null);
            setActionType(null);
        }
    }, [isSuccess, actioningTokenId, refetchMyNFTs]);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                    내 NFT 🏠
                </h1>
                <p className="text-xl text-gray-300">
                    소유한 NFT를 관리하고 판매하세요
                </p>
            </div>

            {!isConnected ? (
                <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
                    <Home className="mx-auto mb-4 text-orange-400" size={64} />
                    <h2 className="text-2xl font-bold mb-4">지갑을 연결하세요</h2>
                    <p className="text-gray-400">
                        내 NFT를 보기 위해서는 먼저 지갑을 연결해야 합니다
                    </p>
                </div>
            ) : myNFTs.length === 0 ? (
                <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
                    <Home className="mx-auto mb-4 text-gray-600" size={64} />
                    <h2 className="text-2xl font-bold mb-2">소유한 NFT가 없습니다</h2>
                    <p className="text-gray-400 mb-6">
                        NFT를 민팅하거나 마켓플레이스에서 구매하세요
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a
                            href="/mint"
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-all"
                        >
                            NFT 민팅하기
                        </a>
                        <a
                            href="/marketplace"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all"
                        >
                            마켓플레이스 가기
                        </a>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myNFTs.map((nft) => (
                        <div
                            key={nft.tokenId}
                            className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-purple-500 transition-all hover:shadow-2xl"
                        >
                            <div className="relative">
                                {nft.metadata?.image ? (
                                    <img
                                        src={nft.metadata.image}
                                        alt={nft.metadata.name}
                                        className="w-full h-64 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-gradient-to-br from-orange-900 to-pink-900 flex items-center justify-center">
                                        <span className="text-6xl">🎨</span>
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-black/70 px-3 py-1 rounded-full text-sm">
                                    #{nft.tokenId}
                                </div>
                                {nft.isListed && (
                                    <div className="absolute top-3 left-3 bg-green-600 px-3 py-1 rounded-full text-sm font-bold">
                                        판매 중
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">
                                    {nft.metadata?.name || `NFT #${nft.tokenId}`}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {nft.metadata?.description || '설명 없음'}
                                </p>

                                {nft.isListed ? (
                                    <div className="space-y-3">
                                        <div className="bg-green-900/30 border border-green-500 rounded-lg p-3">
                                            <p className="text-xs text-gray-400">판매 가격</p>
                                            <p className="text-xl font-bold text-green-400">
                                                {nft.price ? formatTokenAmount(nft.price) : '0'} MTK
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleCancelListing(nft.tokenId)}
                                            disabled={actioningTokenId === nft.tokenId}
                                            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            {actioningTokenId === nft.tokenId && actionType === 'cancel' ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    취소 중...
                                                </>
                                            ) : (
                                                <>
                                                    <X size={20} />
                                                    판매 취소
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-2">
                                                판매 가격 (MTK)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={listingPrice[nft.tokenId] || ''}
                                                onChange={(e) =>
                                                    setListingPrice({
                                                        ...listingPrice,
                                                        [nft.tokenId]: e.target.value,
                                                    })
                                                }
                                                placeholder="100"
                                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleListNFT(nft.tokenId)}
                                            disabled={actioningTokenId === nft.tokenId}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            {actioningTokenId === nft.tokenId && actionType === 'list' ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    등록 중...
                                                </>
                                            ) : (
                                                <>
                                                    <Tag size={20} />
                                                    판매 등록
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}