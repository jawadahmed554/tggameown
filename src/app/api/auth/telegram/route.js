import { privateKeyToAccount } from "thirdweb/wallets";
import { verifySignature } from "thirdweb/auth";
import { NextResponse } from "next/server";
import { createThirdwebClient } from "thirdweb";

const FILE_NAME = "[api/auth/telegram/route.js]";

console.log(`${FILE_NAME} Initializing admin account`);
const privateKey = process.env.SPONSOR_PRIVATE_KEY;
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const secretKey = process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY;

if (!privateKey) {
  console.error(`${FILE_NAME} Missing SPONSOR_PRIVATE_KEY`);
  throw new Error("SPONSOR_PRIVATE_KEY is not defined");
}

if (!clientId) {
  console.error(`${FILE_NAME} Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID`);
  throw new Error("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not defined");
}

if (!secretKey) {
  console.error(`${FILE_NAME} Missing NEXT_PUBLIC_THIRDWEB_SECRET_KEY`);
  throw new Error("NEXT_PUBLIC_THIRDWEB_SECRET_KEY is not defined");
}

export const client = createThirdwebClient({ 
    clientId: clientId,
    secretKey: secretKey
});

console.log(`${FILE_NAME} Thirdweb client created with clientId: ${clientId}`);

const adminAccount = privateKeyToAccount({
  privateKey,
  client,
});

export async function POST(req) {
  console.log(`${FILE_NAME} POST request received`);

  try {
    const { signature, payload } = await req.json();
    console.log(`${FILE_NAME} Received signature and payload`);

    if (!signature || !payload) {
      console.log(`${FILE_NAME} Authentication failed: Missing signature or payload`);
      return NextResponse.json({ message: "Missing signature or payload" }, { status: 400 });
    }

    const userId = await verifyTelegram(signature, payload);
    if (!userId) {
      console.log(`${FILE_NAME} Authentication failed: Invalid credentials`);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    console.log(`${FILE_NAME} Authentication successful for user:`, userId);
    return NextResponse.json({
      userId: userId,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    });
  } catch (error) {
    console.error(`${FILE_NAME} Error processing request:`, error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  console.log(`${FILE_NAME} GET request received`);
  return NextResponse.json({ status: "Telegram auth endpoint is active" });
}

async function verifyTelegram(signature, payload) {
  console.log(`${FILE_NAME} Verifying Telegram signature`);

  try {
    const payloadObj = JSON.parse(payload);

    // Check expiration
    if (!payloadObj.expiration || payloadObj.expiration < Date.now()) {
      console.log(`${FILE_NAME} Verification failed: Payload expired or missing expiration`);
      return false;
    }

    // Check if userId exists
    if (!payloadObj.userId) {
      console.log(`${FILE_NAME} Verification failed: Missing userId in payload`);
      return false;
    }
    const userId = String(payloadObj.userId);
    // Verify the signature
    const isValid = await verifySignature({
      client,
      address: adminAccount.address,
      message: payload,
      signature,
    });

    if (!isValid) {
      console.log(`${FILE_NAME} Verification failed: Invalid signature`);
      return false;
    }

    console.log(`${FILE_NAME} Telegram signature verified successfully`);
    return userId;
  } catch (error) {
    console.error(`${FILE_NAME} Error verifying Telegram signature:`, error);
    return false;
  }
}