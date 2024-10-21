import { createThirdwebClient } from "thirdweb";


// Create client and wallet instances directly in this file
export const client = createThirdwebClient({ 
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID 
  });