"use client";

import { useActiveAccount, AutoConnect } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { client, chain } from "./constants";
import { inAppWallet } from "thirdweb/wallets";

export default function WalletConnector() {
  const account = useActiveAccount();
  const [userId, setUserId] = useState(null);
  const searchParams = useSearchParams();
  const [initializedWallet, setInitializedWallet] = useState(null);

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const newWallet = inAppWallet({
          client: client,
          authProvider: "jwt",
          chain: chain,
          smartAccount: {
            sponsorGas: true,
          },
        });
        setInitializedWallet(newWallet);
        console.log("Wallet created successfully:", newWallet);
      } catch (error) {
        console.error("Error creating wallet:", error);
        console.error("Error details:", error.message);
      }
    };

    initializeWallet();
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token && initializedWallet) {
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
  }, [searchParams, initializedWallet]);

  const handleWalletConnection = async (token) => {
    if (!process.env.NEXT_PUBLIC_AUTH_PHRASE) {
      console.error("AUTH_PHRASE is not set in environment variables");
      return;
    }

    if (!initializedWallet) {
      console.error("Wallet is not initialized");
      return;
    }

    console.log("Token:", token);
    console.log("AUTH_PHRASE:", process.env.NEXT_PUBLIC_AUTH_PHRASE);
    console.log("Client:", client);
    console.log("Initialized Wallet:", initializedWallet);
    console.log("NEXT_PUBLIC_THIRDWEB_CLIENT_ID:", process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID);

    try {
      console.log("Attempting to connect wallet with token");
      await initializedWallet.connect({
        jwt: token,
        encryptionKey: process.env.NEXT_PUBLIC_AUTH_PHRASE,
      });
      console.log("Wallet connected successfully");
    } catch (error) {
      console.error("Wallet connection error:", error);
      console.error("Error stack:", error.stack);
    }
  };

  return (
    <>
      <AutoConnect client={client} wallets={initializedWallet ? [initializedWallet] : []}/>
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