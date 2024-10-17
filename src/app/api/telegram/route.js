import { NextResponse } from 'next/server';
import { privateKeyToAccount } from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";
import crypto from 'crypto';

const FILE_NAME = "[api/telegram/route.js]";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_PRIVATE_KEY;
const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL;

if (!SPONSOR_PRIVATE_KEY || !THIRDWEB_CLIENT_ID || !BOT_TOKEN || !WEBAPP_URL) {
  console.error(`${FILE_NAME} Missing required environment variables`);
  throw new Error("Missing required environment variables");
}

const client = createThirdwebClient({ 
  clientId: THIRDWEB_CLIENT_ID 
});

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
      const expiration = Date.now() + 600_000; // valid for 10 minutes
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