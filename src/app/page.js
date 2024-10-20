import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const WalletConnector = dynamic(() => import('./WalletConnector'), { ssr: false });

export default function Home() {
  return (
    <main className="p-4 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Telegram Wallet Dashboard</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <WalletConnector />
      </Suspense>
    </main>
  );
}