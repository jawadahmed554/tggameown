"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useConnect } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { wallet, client } from "../../constants";
import { Loader2 } from "lucide-react";

function TelegramLoginContent() {
  const searchParams = useSearchParams();
  const { connect } = useConnect();
  const router = useRouter();
  const [params, setParams] = useState({ signature: "", payload: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    const signature = searchParams.get("signature") || "";
    const payload = searchParams.get("payload") || "";
    setParams({ signature, payload });
    console.log("SearchParams:", { signature, payload });
  }, [searchParams]);

  useQuery({
    queryKey: ["telegram-login", params.signature, params.payload],
    queryFn: async () => {
      if (!params.signature || !params.payload) {
        setError("Missing signature or payload.");
        console.error("Missing signature or payload");
        return false;
      }

      try {
        console.log("Attempting to connect wallet with payload:", {
          signature: params.signature,
          payload: params.payload,
        });

        await connect(async () => {
          const connectedWallet = await wallet.connect({
            client,
            strategy: "auth_endpoint",
            payload: JSON.stringify({
              signature: params.signature,
              payload: params.payload,
            }),
            encryptionKey: process.env.NEXT_PUBLIC_AUTH_PHRASE,
          });
          console.log("Connected to wallet successfully", connectedWallet);
          return connectedWallet;
        });

        router.replace("/");
        return true;
      } catch (error) {
        setError("Failed to connect wallet. Please try again.");
        console.error("Connection error:", error);
        return false;
      }
    },
    enabled: !!params.signature && !!params.payload,
  });

  return (
    <div className="w-screen h-screen flex flex-col gap-2 items-center justify-center">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-white" />
          <p>Generating wallet...</p>
        </>
      )}
    </div>
  );
}

export default function TelegramLogin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TelegramLoginContent />
    </Suspense>
  );
}