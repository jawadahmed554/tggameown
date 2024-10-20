"use client";

import { useActiveAccount, AutoConnect } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { client, wallet } from "./constants";
import { useEffect, useState } from "react";

export default function Home() {
  const account = useActiveAccount();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      const user = tgWebApp.initDataUnsafe.user;
      if (user) {
        setUserId(user.id.toString());
      }
    }
  }, []);

  return (
    <main className="p-4 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Telegram Wallet Dashboard</h1>
      <AutoConnect client={client} wallets={[wallet]}/>
      <div className="text-center mt-4">
        {userId && (
          <p className="mb-2">Telegram User ID: {userId}</p>
        )}
        {account ? (
          <p>Wallet Address: {shortenAddress(account.address)}</p>
        ) : (
          <p>Wallet not connected</p>
        )}
      </div>
    </main>
  );
}