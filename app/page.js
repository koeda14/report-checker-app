'use client';

import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('ここに推敲・分析結果が表示されます。');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('待機中');

  const charLength = input.length;
  const isOverLimit = charLength > 800;

  // 漢字率の計算
  const kanjiMatches = input.match(/[\u4e00-\u9faf]/g);
  const kanjiCount = kanjiMatches ? kanjiMatches.length : 0;
  const kanjiRate = charLength > 0 ? Math.round((kanjiCount / charLength) * 100) : 0;

  // 段落数の計算
  const paragraphs = input.split(/\n+/).filter((p) => p.trim().length > 0).length;

  const handleAnalyze = async () => {
    if (!input.trim() || isOverLimit) return;

    setLoading(true);
    setStatus('分析＆推敲中...');
    setOutput('AIが文章を分析し、学術的なトーンに整えています...');

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();
      if (res.ok) {
        setOutput(data.result);
        setStatus('完了');
      } else {
        setOutput(`エラー: ${data.error}`);
        setStatus('エラー');
      }
    } catch (err) {
      setOutput('通信エラーが発生しました。ネットワーク環境を確認してください。');
      setStatus('通信エラー');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>📝 レポート推敲＆文字数チェッカー</h1>
      <p className="subtitle">
        AI特有の機械的な表現を検出し、レポート・学術論文に適した自然な文体に推敲します。
      </p>

      <div className="grid">
        {/* 入力エリア */}
        <div>
          <textarea
            placeholder="ここにレポートの下書きを入力してください（無料枠は最大800文字）..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="stats-bar">
            <span className={isOverLimit ? 'char-limit' : ''}>
              文字数: <strong>{charLength}</strong> / 800
            </span>
            <span>段落数: {paragraphs}</span>
            <span>漢字率: {kanjiRate}%</span>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || isOverLimit || charLength === 0}
          >
            {loading ? '処理中...' : isOverLimit ? '800文字以内で入力してください' : '推敲＆学術調変換を実行'}
          </button>
        </div>

        {/* 出力エリア */}
        <div>
          <div className="badge">{status}</div>
          <div className="result-box">{output}</div>
        </div>
      </div>

      {/* 免責事項・利用規約 */}
      <footer className="footer-terms">
        <h3>利用上の注意・免責事項</h3>
        <ul>
          <li>本ツールは文章推敲および学習の補助を目的としています。生成された内容の完全性や正確性を保証するものではありません。</li>
          <li>大学や教育機関ごとの「生成AI利用ガイドライン」や指示に従ってご利用ください。本ツールの使用によって生じたいかなる不利益や成績等に関する責任は負いかねます。</li>
          <li>入力された文章は推敲処理のみに使用され、学習データ等に恒久保存されることはありません。</li>
        </ul>
      </footer>
    </div>
  );
}