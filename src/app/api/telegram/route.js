import { NextResponse } from 'next/server';

const FILE_NAME = "[api/telegram/route.js]";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL;

if (!BOT_TOKEN) {
  console.error(`${FILE_NAME} Missing TELEGRAM_BOT_TOKEN`);
  throw new Error("TELEGRAM_BOT_TOKEN is not defined");
}

if (!WEBAPP_URL) {
  console.error(`${FILE_NAME} Missing NEXT_PUBLIC_WEBAPP_URL`);
  throw new Error("NEXT_PUBLIC_WEBAPP_URL is not defined");
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

export async function POST(req) {
  console.log(`${FILE_NAME} POST request received`);
  const data = await req.json();
  
  if (data.message && data.message.text) {
    const chatId = data.message.chat.id;
    const messageText = data.message.text.toLowerCase();

    if (messageText === '/start') {
      const userId = data.message.from.id.toString();
      
      try {
        // Get JWT from our internal API route
        const jwtResponse = await fetch(`${WEBAPP_URL}/api/authJwt/generate-jwt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (!jwtResponse.ok) {
          const errorText = await jwtResponse.text();
          console.error(`${FILE_NAME} Failed to generate JWT. Status: ${jwtResponse.status}, Error: ${errorText}`);
          throw new Error(`Failed to generate JWT: ${errorText}`);
        }

        const { token } = await jwtResponse.json();
        
        const webAppUrl = `${WEBAPP_URL}/login/telegram?token=${encodeURIComponent(token)}`;
        
        console.log(`${FILE_NAME} WebApp URL generated:`, webAppUrl);

        const welcomeMessage = "Welcome to our Telegram bot! 🎉 Click the button below to access your wallet.";
        const keyboard = {
          inline_keyboard: [[
            {
              text: "Access Wallet",
              web_app: {url: webAppUrl}
            }
          ]]
        };
        await sendTelegramMessage(chatId, welcomeMessage, keyboard);
        console.log(`${FILE_NAME} Welcome message sent to chat ID:`, chatId);
      } catch (error) {
        console.error(`${FILE_NAME} Error in /start command:`, error);
        await sendTelegramMessage(chatId, "Sorry, there was an error. Please try again later.");
      }
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