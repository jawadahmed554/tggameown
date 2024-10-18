"use client";

import { useActiveAccount, AutoConnect } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { client, wallet } from "./constants";
import { useEffect, useState } from "react";

function CustomAutoConnect({ client, wallets }) {
  useEffect(() => {
    console.log("AutoConnect triggered");
    // Add your custom logic here if needed
  }, []);

  return <AutoConnect client={client} wallets={wallets} />;
}

export default function Home() {
  const account = useActiveAccount();
  const [userId, setUserId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      const user = tgWebApp.initDataUnsafe.user;
      if (user) {
        setUserId(user.id);
        console.log("Telegram user ID set:", user.id);
      }
    }
  }, []);

  useEffect(() => {
    if (account) {
      console.log("Account connected:", account.address);
      setConnectionStatus("Connected");
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
            {userId && <p>User ID: {userId}</p>}
          </>
        ) : null}
      </div>
    </main>
  );
}