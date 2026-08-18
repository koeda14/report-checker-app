import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID が指定されていません。' }, { status: 400 });
    }

    // Webhookの書き込みを最大10秒間ポーリング（1秒ごとに確認）
    for (let i = 0; i < 10; i++) {
      const passcode = await redis.get(`session:${sessionId}`);
      if (passcode) {
        return NextResponse.json({ passcode: String(passcode) });
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return NextResponse.json({ error: 'コードの発行処理中です。少し待って再読み込みしてください。' }, { status: 404 });
  } catch (err) {
    console.error('get-passcode error:', err);
    return NextResponse.json({ error: 'サーバー内部エラーが発生しました。' }, { status: 500 });
  }
}