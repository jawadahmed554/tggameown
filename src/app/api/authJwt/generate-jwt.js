import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error('JWT_PRIVATE_KEY is not set in environment variables');
}

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Generate a unique passkey for this user
    const passkey = crypto.randomBytes(32).toString('hex');

    const payload = {
      iss: process.env.NEXT_PUBLIC_WEBAPP_URL,
      sub: userId,
      aud: "TelegramWallet",
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
      passkey: passkey,
    };

    const token = jwt.sign(payload, PRIVATE_KEY, {
      algorithm: "RS256",
      keyid: "0", // This should match the 'kid' in your JWK
    });

    console.log(`JWT generated for user ID: ${userId}`);
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating JWT:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}