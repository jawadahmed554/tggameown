"use client";

import { Sepolia } from "@thirdweb-dev/chains";
import { inAppWallet } from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";

export const chain = Sepolia;

export const client = createThirdwebClient({ 
  clientId: "323f57bde832fa577bee76553827951e" 
});

export const wallet = inAppWallet({
  smartAccount: {
    sponsorGas: true,
    chain: chain
  }
});

