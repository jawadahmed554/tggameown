import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const FILE_NAME = "[api/telegram/route.js]";
const AUD_VALUE = "TelegramWallet";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL;
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

if (!BOT_TOKEN) {
  console.error(`${FILE_NAME} Missing TELEGRAM_BOT_TOKEN`);
  throw new Error("TELEGRAM_BOT_TOKEN is not defined");
}

if (!WEBAPP_URL) {
  console.error(`${FILE_NAME} Missing NEXT_PUBLIC_WEBAPP_URL`);
  throw new Error("NEXT_PUBLIC_WEBAPP_URL is not defined");
}

if (!JWT_PRIVATE_KEY) {
  console.error(`${FILE_NAME} JWT_PRIVATE_KEY is not defined in the environment variables`);
  throw new Error("JWT_PRIVATE_KEY is not defined");
}

async function sendTelegramMessage(chatId, text, reply_markup = null) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
  };
  if (reply_markup) {
    body.reply_markup = reply_markup;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return response.json();
}

async function generateJWT(userId) {
  console.log(`${FILE_NAME} Generating JWT for user ID:`, userId);

  const payload = {
    iss: WEBAPP_URL,
    sub: userId,
    aud: AUD_VALUE,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
  };

  console.log(`${FILE_NAME} JWT payload:`, JSON.stringify(payload, null, 2));

  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_PRIVATE_KEY, {
      algorithm: "RS256",
      keyid: "0", // This should match the "kid" in your JWKS
    }, (err, token) => {
      if (err) {
        console.error(`${FILE_NAME} Error generating JWT:`, err);
        reject(err);
      } else {
        console.log(`${FILE_NAME} JWT generated successfully`);
        resolve(token);
      }
    });
  });
}

export async function POST(req) {
  console.log(`${FILE_NAME} POST request received`);
  const data = await req.json();
  
  console.log(`${FILE_NAME} Received data:`, JSON.stringify(data, null, 2));
  
  if (data.message && data.message.text) {
    const chatId = data.message.chat.id;
    const messageText = data.message.text.toLowerCase();

    console.log(`${FILE_NAME} Chat ID:`, chatId);
    console.log(`${FILE_NAME} Message text:`, messageText);

    if (messageText === '/start') {
      const userId = data.message.from.id.toString();
      console.log(`${FILE_NAME} User ID:`, userId);
      
      try {
        const token = await generateJWT(userId);
        const webAppUrl = `${WEBAPP_URL}?token=${encodeURIComponent(token)}`;
        console.log(`${FILE_NAME} WebApp URL generated:`, webAppUrl);

        const welcomeMessage = "Welcome to our Telegram bot! 🎉 Click the button below to access your wallet.";
        const keyboard = {
          inline_keyboard: [[
            {
              text: "Access Wallet",
              web_app: { url: webAppUrl }
            }
          ]]
        };
        const sendMessageResponse = await sendTelegramMessage(chatId, welcomeMessage, keyboard);
        console.log(`${FILE_NAME} Welcome message sent to chat ID:`, chatId, 'Response:', sendMessageResponse);
      } catch (error) {
        console.error(`${FILE_NAME} Error in /start command:`, error);
        await sendTelegramMessage(chatId, "Sorry, there was an error. Please try again later.");
      }
    } else {
      const replyMessage = `You said: ${data.message.text}`;
      await sendTelegramMessage(chatId, replyMessage);
    }
  } else {
    console.log(`${FILE_NAME} Received data does not contain a message or text`);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook is active' });
}