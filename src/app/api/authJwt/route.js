import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

    const token = jwt.sign({ userId }, JWT_PRIVATE_KEY, { 
      algorithm: 'RS256',
      expiresIn: '1h',
      keyid: '0'  // Make sure this matches the 'kid' in your JWKS
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating JWT:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}