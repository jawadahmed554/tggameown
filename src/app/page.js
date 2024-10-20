"use client";

import { useActiveAccount, AutoConnect, useConnect } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { client, wallet } from "./constants";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const account = useActiveAccount();
  const [userId, setUserId] = useState(null);
  const searchParams = useSearchParams();
  const connect = useConnect();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      console.log("JWT token received:", token);
      handleWalletConnection(token);
    }

    if (window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      const user = tgWebApp.initDataUnsafe.user;
      if (user) {
        setUserId(user.id.toString());
        console.log("Telegram User ID set:", user.id.toString());
      }
    }
  }, [searchParams]);

  const handleWalletConnection = async (token) => {
    if (!process.env.NEXT_PUBLIC_AUTH_PHRASE) {
      console.error("AUTH_PHRASE is not set in environment variables");
      return;
    }

    try {
      console.log("Attempting to connect wallet with token");
      await connect(wallet, {
        strategy: "jwt",
        jwt: token,
        encryptionKey: process.env.NEXT_PUBLIC_AUTH_PHRASE,
      });
      console.log("Wallet connected successfully");
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

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