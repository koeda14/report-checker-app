import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: '文章を入力してください。' }, { status: 400 });
    }

    if (text.length > 800) {
      return NextResponse.json({ error: '無料枠の上限（800文字）を超えています。' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini APIキーが設定されていません。' }, { status: 500 });
    }

    const prompt = `
あなたは大学レポートおよび学術論文の専門校正アシスタントです。
以下の文章を分析し、指定のフォーマットで出力してください。

【1. 分析と改善点】
- AI生成特有の定型句、不自然な言い回し、論理の飛躍などを箇条書きで簡潔に指摘。

【2. 推敲後の文章】
- 「だ・である」調を統一し、客観的で自然な学術的レポートの文体にリライトした完全な文章を出力。

--- 対象の文章 ---
${text}
`;

    // Google Gemini 2.0 Flash を呼び出し
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ result: outputText });
  } catch (error) {
    return NextResponse.json({ error: 'サーバー内部でエラーが発生しました。' }, { status: 500 });
  }
}