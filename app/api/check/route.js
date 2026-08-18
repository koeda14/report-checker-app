import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: '文章を入力してください。' }, { status: 400 });
    }

    // サーバー側でも文字数制限を厳格にチェック（コスト防御）
    if (text.length > 800) {
      return NextResponse.json({ error: '無料枠の上限（800文字）を超えています。' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーがサーバーに設定されていません。' }, { status: 500 });
    }

    const systemPrompt = `
あなたは大学レポートおよび学術論文の専門校正アシスタントです。
入力された文章に対して以下の形式で出力してください：

【1. 分析と改善点】
- AI生成特有の定型句、不自然な言い回し、論理の飛躍などを箇条書きで簡潔に指摘。

【2. 推敲後の文章】
- 「だ・である」調を統一し、客観的で自然な学術的レポートの文体にリライトした完全な文章を出力。
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ result: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: 'サーバー内部でエラーが発生しました。' }, { status: 500 });
  }
}