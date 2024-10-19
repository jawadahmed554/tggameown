"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { inAppWallet } from "thirdweb/wallets";
import { client } from "../../constants";
import { Loader2 } from "lucide-react";

function TelegramLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const jwtToken = searchParams.get("token");
    setToken(jwtToken);
    console.log("JWT Token received:", jwtToken);
  }, [searchParams]);

  useEffect(() => {
    if (token) {
      connectWallet(token);
    }
  }, [token]);

  async function connectWallet(token) {
    try {
      console.log("Attempting to connect wallet with JWT token");

      const wallet = inAppWallet();
      await wallet.connect({
        client,
        strategy: "auth_endpoint",
        payload: JSON.stringify({ token }),
        encryptionKey: process.env.NEXT_PUBLIC_AUTH_PHRASE,
      });

      console.log("Connected to wallet successfully");
      router.replace("/");
    } catch (error) {
      setError("Failed to connect wallet. Please try again.");
      console.error("Connection error:", error);
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col gap-2 items-center justify-center">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-white" />
          <p>Connecting to wallet...</p>
        </>
      )}
    </div>
  );
}

function TelegramLoginWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TelegramLoginContent />
    </Suspense>
  );
}

export default function TelegramLogin() {
  return <TelegramLoginWrapper />;
}