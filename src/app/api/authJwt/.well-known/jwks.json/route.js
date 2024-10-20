import { NextResponse } from 'next/server';

const FILE_NAME = "[api/authJwt/.well-known/jwks/route.js]";

const jwks = {
  keys: [
    {
      "kty": "RSA",
      "n": "ztTEFYFLffZPkjR0Da3Zfhe90bVIec9NBTAsa6daIIoPT7SvWljUAsZCUx1qT6d9Qgl9bzztrAMlWs6LQawu8-HhH7aS06Rw_JNATlZKP7Z0n9cS-4Fo2mKNtq3eqXp3GKlJPePxVE3Jiodz2UoNIaoKfMO8row8hAnqg0y6JgzE6vvOgRUGX9dVaRd-quCk44MzD3ws14th0uuiX-HGz_7SkL1K7_20Wcvmnekah87KJRrMd6T6mzm7ujAsaYzUYqPvdicEM4FpQ3RPAX7DMok-twzA416C_zzSANjCq9Goq0kf6G6LK4Yh_4k9R-vaTjRBe37dbicuMREpLZ8C8w",
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