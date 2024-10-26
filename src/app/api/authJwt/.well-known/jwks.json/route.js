import { NextResponse } from 'next/server';

const FILE_NAME = "[api/authJwt/.well-known/jwks/route.js]";

const jwks = {
  keys: [
    {
      "kty": "RSA",
      "n": "xyNY3b0v5h5JrX8gW_8nGKE6dpkLxEPxoGMgId74w9PQzvfWfSovcC3jmON1VuKaMga7NXRn5elJvTxj6OOG6lzN_MYtPl7zsQRlMSQQwYkTvN8bJTUv4pNJZ7QBa703pi0SI5sMzSqwE2H9kXX0WrLdaZMzCcbgAdBLi40wowRz0pRn_Xew2m7OIJnIyqWI-0sZ99N0p88L7EHfAsE3Z2Zkfv0YR02y9Zva7xk6k4bMzaH2qB1lFV_7077h3xCPAH3jik4bkfrgcPzrybLIiqsmnQMHqK3bgudYaw1sSOOGqAokodZWssL-HNaVPKvtYZvvE_zUEqz2t3IpvBoUMw",
      "e": "AQAB",
      "alg": "RS256",
      "kid": "0",
      "use": "sig"
    }
  ]
};

export function GET() {
  console.log(`${FILE_NAME} GET request received for JWKS`);
  console.log(`${FILE_NAME} Returning JWKS:`, JSON.stringify(jwks, null, 2));
  return NextResponse.json(jwks);
}