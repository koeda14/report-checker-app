import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// ランダムな6桁英数字を生成（紛らわしい 0, O, 1, I は除外）
function generatePasscode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // 決済完了イベントを受け取った場合
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const passcode = generatePasscode();

    // 1. コードそのものをキーとしてRedisに保存（有効期間: 7日間 = 604800秒）
    await redis.set(`passcode:${passcode}`, { status: 'active', createdAt: Date.now() }, { ex: 604800 });

    // 2. 完了画面で表示できるように session_id に紐づけても保存
    await redis.set(`session:${session.id}`, passcode, { ex: 604800 });

    console.log(`[Success] Issued passcode ${passcode} for session ${session.id}`);
  }

  return NextResponse.json({ received: true });
}