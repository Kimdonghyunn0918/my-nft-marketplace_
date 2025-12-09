'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, TOKEN_ABI, formatTokenAmount } from '@/lib/contracts';
import { Coins, Loader2, CheckCircle2, Gift } from 'lucide-react';

export default function HomePage() {
    const { address, isConnected } = useAccount();
    const [claimStatus, setClaimStatus] = useState<'idle' | 'claiming' | 'success' | 'error'>('idle');

    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
        abi: TOKEN_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    const { data: hasClaimed, refetch: refetchClaimed } = useReadContract({
        address: CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
        abi: TOKEN_ABI,
        functionName: 'hasClaimed',
        args: address ? [address] : undefined,
    });

    const { writeContract, data: hash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isConfirming) {
            setClaimStatus('claiming');
        } else if (isSuccess) {
            setClaimStatus('success');
            refetchBalance();
            refetchClaimed();
            setTimeout(() => setClaimStatus('idle'), 3000);
        }
    }, [isConfirming, isSuccess, refetchBalance, refetchClaimed]);

    const handleClaimTokens = async () => {
        try {
            writeContract({
                address: CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
                abi: TOKEN_ABI,
                functionName: 'claimTokens',
            });
        } catch (error) {
            console.error('Claim failed:', error);
            setClaimStatus('error');
            setTimeout(() => setClaimStatus('idle'), 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    무료 토큰 드랍! 🎁
                </h1>
                <p className="text-xl text-gray-300">
                    NFT를 구매하기 위한 MyToken(MTK)을 무료로 받으세요
                </p>
            </div>

            {!isConnected ? (
                <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
                    <Coins className="mx-auto mb-4 text-yellow-400" size={64} />
                    <h2 className="text-2xl font-bold mb-4">지갑을 연결하세요</h2>
                    <p className="text-gray-400">
                        토큰을 받기 위해서는 먼저 지갑을 연결해야 합니다
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 border border-blue-500 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 mb-2">현재 잔액</p>
                                <p className="text-4xl font-bold text-white">
                                    {balance ? formatTokenAmount(balance as bigint) : '0'} MTK
                                </p>
                            </div>
                            <Coins className="text-yellow-400" size={64} />
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                        {hasClaimed ? (
                            <div className="text-center py-8">
                                <CheckCircle2 className="mx-auto mb-4 text-green-400" size={64} />
                                <h2 className="text-2xl font-bold mb-2">이미 토큰을 받았습니다!</h2>
                                <p className="text-gray-400">1인당 1회만 토큰을 받을 수 있습니다</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <Gift className="mx-auto mb-4 text-purple-400" size={64} />
                                    <h2 className="text-3xl font-bold mb-2">1,000 MTK 무료 받기</h2>
                                    <p className="text-gray-400">이 토큰으로 NFT를 구매할 수 있습니다</p>
                                </div>

                                <button
                                    onClick={handleClaimTokens}
                                    disabled={claimStatus === 'claiming'}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-3"
                                >
                                    {claimStatus === 'claiming' ? (
                                        <>
                                            <Loader2 className="animate-spin" size={24} />
                                            토큰 받는 중...
                                        </>
                                    ) : claimStatus === 'success' ? (
                                        <>
                                            <CheckCircle2 size={24} />
                                            토큰 수령 완료!
                                        </>
                                    ) : (
                                        <>
                                            <Gift size={24} />
                                            무료로 토큰 받기
                                        </>
                                    )}
                                </button>

                                {claimStatus === 'error' && (
                                    <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-center">
                                        <p className="text-red-200">토큰 수령에 실패했습니다. 다시 시도해주세요.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
