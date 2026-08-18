import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  // Webhookの処理完了まで少し待機して取得を試みる
  for (let i = 0; i < 5; i++) {
    const passcode = await redis.get(`session:${sessionId}`);
    if (passcode) {
      return NextResponse.json({ passcode });
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return NextResponse.json({ error: 'コードの発行処理中です。少し待って再読み込みしてください。' }, { status: 404 });
}