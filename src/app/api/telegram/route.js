import { NextResponse } from 'next/server';
import { privateKeyToAccount } from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";

const FILE_NAME = "[api/telegram/route.js]";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_PRIVATE_KEY;
const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const THIRDWEB_SECRET_KEY = process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY;
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL;

if (!SPONSOR_PRIVATE_KEY) {
  console.error(`${FILE_NAME} Missing SPONSOR_PRIVATE_KEY`);
  throw new Error("SPONSOR_PRIVATE_KEY is not defined");
}

if (!THIRDWEB_CLIENT_ID) {
  console.error(`${FILE_NAME} Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID`);
  throw new Error("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not defined");
}

if (!THIRDWEB_SECRET_KEY) {
  console.error(`${FILE_NAME} Missing NEXT_PUBLIC_THIRDWEB_SECRET_KEY`);
  throw new Error("NEXT_PUBLIC_THIRDWEB_SECRET_KEY is not defined");
}

if (!BOT_TOKEN) {
  console.error(`${FILE_NAME} Missing TELEGRAM_BOT_TOKEN`);
  throw new Error("TELEGRAM_BOT_TOKEN is not defined");
}

if (!WEBAPP_URL) {
  console.error(`${FILE_NAME} Missing NEXT_PUBLIC_WEBAPP_URL`);
  throw new Error("NEXT_PUBLIC_WEBAPP_URL is not defined");
}

const client = createThirdwebClient({ 
  clientId: THIRDWEB_CLIENT_ID,
  secretKey: THIRDWEB_SECRET_KEY
});

console.log(`${FILE_NAME} Thirdweb client created with clientId: ${THIRDWEB_CLIENT_ID}`);

const sponsorAccount = privateKeyToAccount({
    privateKey: SPONSOR_PRIVATE_KEY,
    client,
});

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

export async function POST(req) {
  console.log(`${FILE_NAME} POST request received`);
  const data = await req.json();
  
  if (data.message && data.message.text) {
    const chatId = data.message.chat.id;
    const messageText = data.message.text.toLowerCase();

    if (messageText === '/start') {
      const username = data.message.from.id.toString();
      const expiration = Date.now() + 600000; // valid for 10 minutes
      const message = JSON.stringify({
        username,
        expiration,
      });
      const authCode = await sponsorAccount.signMessage({
        message,
      });

      const webAppUrl = `${WEBAPP_URL}/login/telegram?signature=${encodeURIComponent(authCode)}&message=${encodeURIComponent(message)}`;
      
      const welcomeMessage = "Welcome to our Telegram bot! 🎉 Click the button below to launch our WebApp.";
      const keyboard = {
        inline_keyboard: [[
          {
            text: "Launch WebApp",
            web_app: {url: webAppUrl}
          }
        ]]
      };
      await sendTelegramMessage(chatId, welcomeMessage, keyboard);
    } else {
      const replyMessage = `You said: ${data.message.text}`;
      await sendTelegramMessage(chatId, replyMessage);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook is active' });
}