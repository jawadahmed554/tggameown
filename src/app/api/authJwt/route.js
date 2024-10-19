import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

if (!JWT_PRIVATE_KEY) {
  console.error("JWT_PRIVATE_KEY is not defined in the environment variables");
  throw new Error("JWT_PRIVATE_KEY is not defined");
}

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const payload = {
      iss: process.env.NEXT_PUBLIC_WEBAPP_URL,
      sub: userId,
      aud: "TelegramWallet", // or any other identifier for your app
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    };

    const token = jwt.sign(payload, JWT_PRIVATE_KEY, { 
      algorithm: 'RS256',
      keyid: '0'  // Make sure this matches the 'kid' in your JWKS
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating JWT:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}