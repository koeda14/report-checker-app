import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

function generatePasscode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const passcode = generatePasscode();

      // パスコード単体と、セッションIDに対応するパスコードの両方をRedisに保存（有効期限7日間）
      await redis.set(`passcode:${passcode}`, { status: 'active', createdAt: Date.now() }, { ex: 604800 });
      await redis.set(`session:${session.id}`, passcode, { ex: 604800 });

      console.log(`[Success] Issued passcode ${passcode} for session ${session.id}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: `Webhook handler error: ${err.message}` }, { status: 400 });
  }
}