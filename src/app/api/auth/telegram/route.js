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

export async function GET(req) {
  console.log(`${FILE_NAME} GET request received`);
  return NextResponse.json({ status: "Telegram auth endpoint is active" });
}

export async function POST(req) {
    console.log(`${FILE_NAME} POST request received`);
  
    try {
      const body = await req.json();
      console.log(`${FILE_NAME} Received full request body:`, JSON.stringify(body, null, 2));
  
      const { payload } = body;
  
      if (!payload) {
        console.log(`${FILE_NAME} Authentication failed: Missing payload`);
        return NextResponse.json({ message: "Missing payload" }, { status: 400 });
      }
  
      const parsedPayload = JSON.parse(payload);
      console.log(`${FILE_NAME} Parsed payload:`, JSON.stringify(parsedPayload, null, 2));
  
      const { signature, payload: innerPayload } = parsedPayload;
  
      if (!signature || !innerPayload) {
        console.log(`${FILE_NAME} Authentication failed: Missing signature or inner payload`);
        return NextResponse.json({ message: "Invalid payload structure" }, { status: 400 });
      }
  
      const verificationResult = await verifyTelegram(signature, innerPayload);
      if (!verificationResult) {
        console.log(`${FILE_NAME} Authentication failed: Invalid credentials`);
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }
  
      console.log(`${FILE_NAME} Authentication successful for user:`, verificationResult.userId);
      return NextResponse.json(verificationResult);
    } catch (error) {
      console.error(`${FILE_NAME} Error processing request:`, error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  }
  
  async function verifyTelegram(signature, payload) {
    console.log(`${FILE_NAME} Verifying Telegram payload:`, payload);
    console.log(`${FILE_NAME} Signature:`, signature);
  
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
      return {
        userId: String(payloadObj.userId),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      };
    } catch (error) {
      console.error(`${FILE_NAME} Error verifying Telegram payload:`, error);
      return false;
    }
  }