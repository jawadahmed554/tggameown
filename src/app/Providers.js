"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { chain, wallet } from "./constants";
import { client } from "./constants";

const queryClient = new QueryClient();

function logWithFileName(message, data = null) {
    const logMessage = `[Providers.js] ${message}`;
    if (data) {
        console.log(logMessage, data);
    } else {
        console.log(logMessage);
    }
}

export default function Providers({ children }) {
    logWithFileName("Rendering Provider component");
    logWithFileName("Client:", client);
    logWithFileName("Wallet:", wallet);
    logWithFileName("Chain:", chain);

    return (
        <ThirdwebProvider 
          client={client}
          activeChain={chain}
          supportedWallets={[wallet]}
        >
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </ThirdwebProvider>
    );
}