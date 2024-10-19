import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const FILE_NAME = "[api/authJwt/generate-jwt/route.js]";

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

if (!JWT_PRIVATE_KEY) {
  console.error(`${FILE_NAME} JWT_PRIVATE_KEY is not defined in the environment variables`);
  throw new Error("JWT_PRIVATE_KEY is not defined");
}

export async function POST(request) {
  console.log(`${FILE_NAME} POST request received`);

  try {
    const body = await request.json();
    console.log(`${FILE_NAME} Request body:`, JSON.stringify(body, null, 2));

    const { userId } = body;

    if (!userId || typeof userId !== 'string') {
      console.error(`${FILE_NAME} Invalid user ID:`, userId);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    console.log(`${FILE_NAME} Generating JWT for user ID:`, userId);

    const token = jwt.sign({ userId }, JWT_PRIVATE_KEY, { 
      algorithm: 'RS256',
      expiresIn: '1h',
      keyid: '0'  // Make sure this matches the 'kid' in your JWKS
    });

    console.log(`${FILE_NAME} JWT generated successfully`);

    return NextResponse.json({ token });
  } catch (error) {
    console.error(`${FILE_NAME} Error generating JWT:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}