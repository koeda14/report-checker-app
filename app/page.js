'use client';

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Stripeの決済リンク
  const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/test_fZucMY5xscuG1WtcVn5wI00';

  const maxChars = isPremium ? 10000 : 800;

  // パスコード認証
  const handleUnlock = () => {
    if (passcode.trim() === 'REPORT2026') {
      setIsPremium(true);
      setError('');
      alert('プレミアム機能（最大10,000文字）が解放されました！');
    } else {
      setError('パスコードが正しくありません。購入完了時のパスコードを入力してください。');
    }
  };

  const handleCheck = async () => {
    if (!text.trim()) {
      setError('文章を入力してください。');
      return;
    }
    if (text.length > maxChars) {
      setError(`文字数制限（${maxChars.toLocaleString()}文字）を超えています。`);
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, passcode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'エラーが発生しました。');
      }

      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* ヘッダー */}
        <header className="mb-8 text-center">
          <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
            大学生向け レポート・論文 専門AI推敲
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
            レポートAIチェッカー
          </h1>
          <p className="text-slate-600 text-sm md:text-base">
            AI特有の定型表現や不自然な論理展開を検出し、学術的で自然な「だ・である」調へリライトします。
          </p>
        </header>

        {/* プレミアムバナー / パスコード入力 */}
        <div className="mb-6 p-4 rounded-xl border bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${isPremium ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-700'}`}>
                {isPremium ? '★ プレミアムプラン適用中' : '無料プラン（800文字）'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isPremium ? '期末レポート・卒業論文向けの長文推敲モード（最大10,000文字）' : '期末レポートや卒論などの長文（最大10,000文字）はプレミアムチケットが必要です。'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {!isPremium ? (
              <>
                <a
                  href={STRIPE_PAYMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition text-center"
                >
                  プレミアムチケットを購入（¥500）
                </a>
                <div className="flex items-center gap-1">
                  <input
                    type="password"
                    placeholder="パスコード"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="p-2 text-xs border rounded-lg w-28 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleUnlock}
                    className="px-3 py-2 text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 rounded-lg transition"
                  >
                    解除
                  </button>
                </div>
              </>
            ) : (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                ✓ 10,000文字解放済み
              </span>
            )}
          </div>
        </div>

        {/* メイン入力エリア */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-700">対象テキスト</label>
            <span className={`text-xs font-medium ${text.length > maxChars ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
              {text.length.toLocaleString()} / {maxChars.toLocaleString()} 文字
            </span>
          </div>

          <textarea
            rows={10}
            className="w-full p-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
            placeholder="ここにチェックしたいレポートの本文を貼り付けてください..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCheck}
              disabled={loading || !text.trim() || text.length > maxChars}
              className={`px-6 py-3 rounded-xl font-bold text-white shadow transition flex items-center gap-2 ${
                loading || !text.trim() || text.length > maxChars
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>AI推敲中...</span>
                </>
              ) : (
                <span>AIで推敲・チェックする</span>
              )}
            </button>
          </div>
        </div>

        {/* 出力結果エリア */}
        {result && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-12">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span>診断・推敲結果</span>
            </h2>
            <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-100">
              {result}
            </div>
          </div>
        )}

        {/* フッター / アフィリエイト・規約プレースホルダー */}
        <footer className="text-center text-xs text-slate-400 border-t border-slate-200 pt-8 pb-4">
          <p>© 2026 レポートAIチェッカー. All rights reserved.</p>
        </footer>

      </div>
    </main>
  );
}