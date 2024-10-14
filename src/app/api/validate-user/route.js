import { NextResponse } from 'next/server';
import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function validateInitData(initData) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  urlParams.sort();

  let dataCheckString = '';
  for (const [key, value] of urlParams.entries()) {
    dataCheckString += `${key}=${value}\n`;
  }
  dataCheckString = dataCheckString.slice(0, -1);

  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const calculatedHash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  return calculatedHash === hash;
}

export async function POST(req) {
  const { initData } = await req.json();

  if (validateInitData(initData)) {
    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get('user'));
    return NextResponse.json({ valid: true, user });
  } else {
    return NextResponse.json({ valid: false });
  }
}