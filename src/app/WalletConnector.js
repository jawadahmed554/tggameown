"use client";

import { useActiveAccount, AutoConnect, useConnect } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { client, wallet } from "./constants";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function WalletConnector() {
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
  
    console.log("Token received:", token);
    console.log("AUTH_PHRASE:", process.env.NEXT_PUBLIC_AUTH_PHRASE);
  
    try {
      console.log("Wallet instance before connection:", wallet);
      console.log("Attempting to connect wallet with token");
      
      if (typeof wallet.connect !== 'function') {
        console.error("wallet.connect is not a function. Wallet object:", wallet);
        return;
      }
  
      await wallet.connect({
        strategy: "jwt",
        jwt: token,
        encryptionKey: process.env.NEXT_PUBLIC_AUTH_PHRASE,
      });
      console.log("Wallet connected successfully");
      console.log("Wallet instance after connection:", wallet);
    } catch (error) {
      console.error("Wallet connection error:", error);
      console.error("Error stack:", error.stack);
    }
  };

  return (
    <>
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
    </>
  );
}