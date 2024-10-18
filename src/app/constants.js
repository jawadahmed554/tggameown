"use client";

import { Sepolia } from "@thirdweb-dev/chains";
import { inAppWallet } from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";

export const chain = Sepolia;

export const client = createThirdwebClient({ 
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID 
});

export const wallet = inAppWallet({
  smartAccount: {
    sponsorGas: true,
    chain: chain
  }
});

console.log("Client instance in constants:", client);
console.log("Wallet instance in constants:", wallet);
console.log("Chain in constants:", chain);