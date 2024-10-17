import { NextResponse } from 'next/server';
import { privateKeyToAccount } from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";
import crypto from 'crypto';

const FILE_NAME = "[api/telegram/route.js]";

console.log(`${FILE_NAME} File loaded`);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_PRIVATE_KEY;
const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL;

if (!SPONSOR_PRIVATE_KEY || !THIRDWEB_CLIENT_ID || !BOT_TOKEN || !WEBAPP_URL) {
  console.error(`${FILE_NAME} Missing required environment variables`);
  throw new Error("Missing required environment variables");
}

console.log(`${FILE_NAME} Creating Thirdweb client`);
const client = createThirdwebClient({ 
  clientId: THIRDWEB_CLIENT_ID 
});

console.log(`${FILE_NAME} Creating sponsor account`);
const sponsorAccount = privateKeyToAccount({
    privateKey: SPONSOR_PRIVATE_KEY,
    client,
});

function generateInitDataHash(dataString) {
  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  return crypto.createHmac('sha256', secret).update(dataString).digest('hex');
}

async function sendTelegramMessage(chatId, text, reply_markup = null) {
  console.log(`${FILE_NAME} sendTelegramMessage called`, { chatId, text });
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
  console.log(`${FILE_NAME} Telegram message sent`);
  return response.json();
}

export async function POST(req) {
  console.log(`${FILE_NAME} POST request received`);
  const data = await req.json();
  
  if (data.message && data.message.text) {
    console.log(`${FILE_NAME} Message received:`, data.message.text);
    const chatId = data.message.chat.id;
    const messageText = data.message.text.toLowerCase();

    if (messageText === '/start') {
      console.log(`${FILE_NAME} /start command received`);
      const username = data.message.from.id.toString();
      const expiration = Date.now() + 600_000; // valid for 10 minutes
      const message = JSON.stringify({
        username,
        expiration,
      });
      console.log(`${FILE_NAME} Signing message`);
      const signature = await sponsorAccount.signMessage({
        message,
      });
      console.log(`${FILE_NAME} Message signed`);

      // Create initData
      const initDataParams = new URLSearchParams({
        query_id: data.message.message_id.toString(),
        user: JSON.stringify(data.message.from),
        auth_date: Math.floor(Date.now() / 1000).toString(),
      });
      
      // Sort the parameters
      const sortedParams = new URLSearchParams([...initDataParams.entries()].sort());
      const dataCheckString = sortedParams.toString();

      const hash = generateInitDataHash(dataCheckString);
      sortedParams.append('hash', hash);

      const initData = sortedParams.toString();

      console.log(`${FILE_NAME} Generated initData:`, initData);
      console.log(`${FILE_NAME} Generated hash:`, hash);

      const webAppUrl = `${WEBAPP_URL}/login/telegram?signature=${encodeURIComponent(signature)}&message=${encodeURIComponent(message)}&initData=${encodeURIComponent(initData)}`;
      
      const welcomeMessage = "Welcome to our Telegram bot! 🎉 Click the button below to launch our WebApp.";
      const keyboard = {
        inline_keyboard: [[
          {
            text: "Launch WebApp",
            web_app: {url: webAppUrl}
          }
        ]]
      };
      console.log(`${FILE_NAME} Sending welcome message`);
      await sendTelegramMessage(chatId, welcomeMessage, keyboard);
    } else {
      console.log(`${FILE_NAME} Sending reply message`);
      const replyMessage = `You said: ${data.message.text}`;
      await sendTelegramMessage(chatId, replyMessage);
    }
  }

  console.log(`${FILE_NAME} POST request completed`);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  console.log(`${FILE_NAME} GET request received`);
  return NextResponse.json({ status: 'Telegram webhook is active' });
}