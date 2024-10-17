"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useConnect } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { client, wallet } from "../../constants";
import { Loader2 } from "lucide-react";

function TelegramLoginContent() {
    const searchParams = useSearchParams();
    const { connect } = useConnect();
    const router = useRouter();
    const [params, setParams] = useState({ signature: '', message: '', initData: '' });
    const [status, setStatus] = useState('Initializing...');

    useEffect(() => {
        const signature = searchParams.get('signature') || '';
        const message = searchParams.get('message') || '';
        const initData = searchParams.get('initData') || '';
        setParams({ signature, message, initData });
        console.log('[/login/telegram/page.js] SearchParams:', { signature, message, initData });
    }, [searchParams]);

    useQuery({
        queryKey: ["telegram-login", params.signature, params.message, params.initData],
        queryFn: async () => {
            if (!params.signature || !params.message || !params.initData) {
                console.error('[/login/telegram/page.js] Missing signature, message, or initData');
                setStatus('Missing authentication parameters');
                return false;
            }
            try {
                setStatus('Connecting wallet...');
                await connect(async () => {
                    console.log('[/login/telegram/page.js] Attempting to connect wallet');
                    const connectedWallet = await wallet.connect({
                        client,
                        strategy: "auth_endpoint",
                        payload: JSON.stringify({
                            signature: params.signature,
                            message: params.message,
                            initData: params.initData,
                        }),
                        encryptionKey: process.env.NEXT_PUBLIC_AUTH_PHRASE,
                    });
                    console.log('[/login/telegram/page.js] Wallet connection result:', connectedWallet);
                    return connectedWallet;
                });
                console.log("[/login/telegram/page.js] Wallet connected successfully");
                setStatus('Wallet connected. Redirecting...');
                router.replace("/");
                return true;
            } catch (error) {
                console.error('[/login/telegram/page.js] Connection error:', error);
                setStatus(`Connection error: ${error.message}`);
                return false;
            }
        },
        enabled: !!params.signature && !!params.message && !!params.initData,
        retry: false,
    });

    return (
        <div className="w-screen h-screen flex flex-col gap-2 items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
            <p>{status}</p>
        </div>
    );
}

export default function TelegramLogin() {
    console.log("[/login/telegram/page.js] TelegramLogin component rendered");
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TelegramLoginContent />
        </Suspense>
    );
}