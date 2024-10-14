import { NextResponse } from 'next/server';

async function sendTelegramMessage(chatId, text, reply_markup = null) {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
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
  const data = await req.json();
  
  if (data.message && data.message.text) {
    const chatId = data.message.chat.id;
    const messageText = data.message.text.toLowerCase();

    if (messageText === '/start') {
      const welcomeMessage = "Welcome to our Telegram bot! 🎉 Click the button below to launch our WebApp.";
      const webAppUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://6d4d-2a00-23ee-1868-7da-134e-9dc4-a66b-de3d.ngrok-free.app';
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