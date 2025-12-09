'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-black text-white p-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">NFT Marketplace</Link>
        <nav className="flex gap-10 items-center">
          <Link href="/mint">민팅</Link>
          <Link href="/marketplace">마켓</Link>
          <Link href="/my-nfts">내 NFT</Link>
          <ConnectButton />
        </nav>
      </div>
    </header>
  );
}
