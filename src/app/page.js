"use client";

import { useActiveAccount, AutoConnect } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { client, wallet } from "./constants";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function CustomAutoConnect({ client, wallets }) {
  useEffect(() => {
    console.log("AutoConnect triggered");
  }, []);

  return <AutoConnect client={client} wallets={wallets} />;
}

export default function Home() {
  const account = useActiveAccount();
  const [userId, setUserId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const router = useRouter();

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      const user = tgWebApp.initDataUnsafe.user;
      if (user) {
        setUserId(user.id.toString());
        console.log("Telegram user ID set:", user.id.toString());
      } else {
        console.log("No Telegram user data found");
        // Optionally redirect to a login page or show an error
        // router.push('/login');
      }
    } else {
      console.log("Telegram WebApp not detected");
      // Optionally redirect to a non-Telegram version of your app
      // router.push('/non-telegram-version');
    }
  }, []);

  useEffect(() => {
    if (account) {
      console.log("Account connected:", account.address);
      setConnectionStatus("Connected");
      // Here you can add logic to verify the account matches the Telegram user
    } else {
      console.log("No account connected");
      setConnectionStatus("Connecting wallet...");
    }
  }, [account]);
  
  return (
    <main className="p-4 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Telegram Wallet Dashboard</h1>
      <CustomAutoConnect client={client} wallets={[wallet]}/>
      <div className="text-center">
        <p className="mb-2">{connectionStatus}</p>
        {account ? (
          <>
            <p className="mb-2">
              Wallet Address: {shortenAddress(account.address)}
            </p>
            {userId && <p>Telegram User ID: {userId}</p>}
          </>
        ) : (
          <p>Please connect your wallet</p>
        )}
      </div>
      {!account && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.push('/login/telegram')}
        >
          Connect Wallet
        </button>
      )}
    </main>
  );
}