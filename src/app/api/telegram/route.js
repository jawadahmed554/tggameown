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
        console.log(`${FILE_NAME} Attempting to generate JWT for user:`, userId);
        
        // Get JWT from our internal API route
        const jwtResponse = await fetch(`${WEBAPP_URL}/api/authJwt/generate-jwt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        console.log(`${FILE_NAME} JWT response status:`, jwtResponse.status);

        const responseText = await jwtResponse.text();
        console.log(`${FILE_NAME} JWT response body:`, responseText);

        if (!jwtResponse.ok) {
          throw new Error(`Failed to generate JWT: ${responseText}`);
        }

        const responseData = JSON.parse(responseText);
        console.log(`${FILE_NAME} JWT response data:`, JSON.stringify(responseData, null, 2));

        // ... (rest of the code remains the same)
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