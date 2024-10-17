import { privateKeyToAccount } from "thirdweb/wallets";
import { verifySignature } from "thirdweb/auth";
import { NextResponse } from "next/server";
import { client } from "../../../constants";

const FILE_NAME = "[api/auth/telegram/route.js]";

console.log(`${FILE_NAME} Initializing admin account`);
const adminAccount = privateKeyToAccount({
    privateKey: process.env.SPONSOR_PRIVATE_KEY,
    client,
});

export async function POST(req) {
    console.log(`${FILE_NAME} POST request received`);
    try {
        const { payload } = await req.json();
        console.log(`${FILE_NAME} Received payload:`, payload);
        const { signature, message } = JSON.parse(payload);
        console.log(`${FILE_NAME} Parsed signature and message`);

        const userId = await verifyTelegram(signature, message);

        if (!userId) {
            console.log(`${FILE_NAME} Authentication failed: Invalid credentials`);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        console.log(`${FILE_NAME} Authentication successful for user:`, userId);
        return NextResponse.json({ userId });
    } catch (error) {
        console.error(`${FILE_NAME} Error processing request:`, error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req) {
    console.log(`${FILE_NAME} GET request received`);
    return NextResponse.json({ status: 'Telegram auth endpoint is active' });
}

async function verifyTelegram(signature, message) {
    console.log(`${FILE_NAME} Verifying Telegram signature`);
    try {
        const metadata = JSON.parse(message);
        
        if (!metadata.expiration || metadata.expiration < Date.now()) {
            console.log(`${FILE_NAME} Verification failed: Signature expired or missing expiration`);
            return false;
        }

        if (!metadata.username) {
            console.log(`${FILE_NAME} Verification failed: Missing username in metadata`);
            return false;
        }

        const isValid = await verifySignature({
            client,
            address: adminAccount.address,
            message: message,
            signature,
        });

        if (!isValid) {
            console.log(`${FILE_NAME} Verification failed: Invalid signature`);
            return false;
        }

        console.log(`${FILE_NAME} Telegram signature verified successfully`);
        return metadata.username;
    } catch (error) {
        console.error(`${FILE_NAME} Error verifying Telegram signature:`, error);
        return false;
    }
}