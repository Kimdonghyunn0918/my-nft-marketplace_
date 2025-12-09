'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, NFT_ABI } from '@/lib/contracts';
import { Image, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

export default function MintPage() {
    const { address, isConnected } = useAccount();
    const [imageUrl, setImageUrl] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mintStatus, setMintStatus] = useState<'idle' | 'minting' | 'success' | 'error'>('idle');

    const { writeContract, data: hash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleMint = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageUrl || !name || !description) {
            alert('모든 필드를 입력해주세요');
            return;
        }

        try {
            // 메타데이터 JSON 생성 (실제로는 IPFS에 업로드해야 함)
            const metadata = {
                name,
                description,
                image: imageUrl,
            };

            const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            writeContract({
                address: CONTRACT_ADDRESSES.NFT as `0x${string}`,
                abi: NFT_ABI,
                functionName: 'mintNFT',
                args: [tokenURI],
            });

            setMintStatus('minting');
        } catch (error) {
            console.error('Minting failed:', error);
            setMintStatus('error');
        }
    };

    // 트랜잭션 성공 시
    if (isSuccess && mintStatus === 'minting') {
        setMintStatus('success');
        setTimeout(() => {
            setMintStatus('idle');
            setImageUrl('');
            setName('');
            setDescription('');
        }, 3000);
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                    NFT 민팅 🎨
                </h1>
                <p className="text-xl text-gray-300">
                    나만의 NFT를 생성하고 마켓플레이스에 등록하세요
                </p>
            </div>

            {!isConnected ? (
                <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
                    <Image className="mx-auto mb-4 text-purple-400" size={64} />
                    <h2 className="text-2xl font-bold mb-4">지갑을 연결하세요</h2>
                    <p className="text-gray-400">
                        NFT를 민팅하기 위해서는 먼저 지갑을 연결해야 합니다
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* 입력 폼 */}
                    <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Sparkles className="text-yellow-400" />
                            NFT 정보 입력
                        </h2>

                        <form onSubmit={handleMint} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">
                                    이미지 URL
                                </label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.png"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    직접 URL을 입력하거나 이미지 호스팅 서비스를 사용하세요
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">
                                    NFT 이름
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="나의 첫 번째 NFT"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">
                                    설명
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="이 NFT에 대한 설명을 입력하세요"
                                    rows={4}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isConfirming || mintStatus === 'minting'}
                                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-3"
                            >
                                {isConfirming ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        민팅 중...
                                    </>
                                ) : mintStatus === 'success' ? (
                                    <>
                                        <CheckCircle2 size={24} />
                                        민팅 완료!
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={24} />
                                        NFT 민팅하기
                                    </>
                                )}
                            </button>

                            {mintStatus === 'error' && (
                                <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-center">
                                    <p className="text-red-200">
                                        민팅에 실패했습니다. 다시 시도해주세요.
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* 미리보기 */}
                    <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                        <h2 className="text-2xl font-bold mb-6">미리보기</h2>

                        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-600">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="NFT Preview"
                                    className="w-full h-64 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Invalid+Image';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-64 flex items-center justify-center bg-slate-800">
                                    <div className="text-center">
                                        <Image className="mx-auto mb-2 text-gray-600" size={48} />
                                        <p className="text-gray-500">이미지 URL을 입력하세요</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">
                                    {name || '제목을 입력하세요'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {description || '설명을 입력하세요'}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-700">
                                    <p className="text-sm text-gray-500">생성자</p>
                                    <p className="text-sm font-mono text-gray-300 truncate">
                                        {address}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 안내 사항 */}
            <div className="mt-8 bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    💡 민팅 가이드
                </h3>
                <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>누구나 무료로 NFT를 생성할 수 있습니다 (가스비만 필요)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>민팅된 NFT는 자동으로 소유권이 부여됩니다</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>이미지는 공개적으로 접근 가능한 URL이어야 합니다</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>민팅 후 마켓플레이스에서 판매할 수 있습니다</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}