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
  const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/test_6oU8wI5xs7am0Sp5sV5wI05';
    const maxChars = isPremium ? 10000 : 800;

  // パスコードの有効化
  const handleUnlock = () => {
    if (!passcode.trim()) {
      setError('パスコードを入力してください。');
      return;
    }
    // 6桁コードが入力されていればプレミアムモードを有効化（実際の有効性チェックはAPIリクエスト時にサーバー側で照合）
    setIsPremium(true);
    setError('');
    alert('プレミアムコードをセットしました！推敲を実行してください。');
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
        body: JSON.stringify({ text, passcode: passcode.trim() }),
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 16px', fontFamily: 'sans-serif', color: '#1e293b' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* ヘッダーエリア */}
        <header style={{ marginBottom: '24px' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '9999px', marginBottom: '8px' }}>
            大学生向け レポート・論文 専門AI推敲
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#0f172a' }}>
                レポートAIチェッカー
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                AI特有の定型表現や不自然な論理展開を検出し、学術的で自然な「だ・である」調へリライトします。
              </p>
            </div>

            {/* プレミアムステータス / チケット購入 */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', textAlign: 'right', minWidth: '260px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: isPremium ? '#15803d' : '#64748b' }}>
                  {isPremium ? '★ プレミアム適用中' : '無料プラン（800文字）'}
                </span>
                {!isPremium && (
                  <a
                    href={STRIPE_PAYMENT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '11px', fontWeight: 'bold', color: '#b45309', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '6px', textDecoration: 'none', border: '1px solid #fde68a' }}
                  >
                    1万字解放（¥500）↗
                  </a>
                )}
              </div>

              {!isPremium ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="6桁パスコード"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                    maxLength={8}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}
                  />
                  <button
                    onClick={handleUnlock}
                    style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#334155', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    適用
                  </button>
                </div>
              ) : (
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>✓ 期末レポート・卒論モード（10,000文字）</span>
              )}
            </div>
          </div>
        </header>

        {/* 入力フォーム */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>対象テキスト</label>
            <span style={{ fontSize: '12px', color: text.length > maxChars ? '#ef4444' : '#64748b', fontWeight: text.length > maxChars ? 'bold' : 'normal' }}>
              {text.length.toLocaleString()} / {maxChars.toLocaleString()} 文字
            </span>
          </div>

          <textarea
            rows={10}
            style={{ width: '100%', boxSizing: 'border-box', padding: '14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', lineHeight: '1.6', outline: 'none', resize: 'vertical' }}
            placeholder="ここにチェックしたいレポートの本文を貼り付けてください..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {error && (
            <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCheck}
              disabled={loading || !text.trim() || text.length > maxChars}
              style={{
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#ffffff',
                backgroundColor: loading || !text.trim() || text.length > maxChars ? '#94a3b8' : '#4f46e5',
                border: 'none',
                borderRadius: '10px',
                cursor: loading || !text.trim() || text.length > maxChars ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
              }}
            >
              {loading ? 'AI推敲中...' : 'AIで推敲・チェックする'}
            </button>
          </div>
        </div>

        {/* 出力結果エリア */}
        {result && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}>
              推敲・チェック結果
            </h2>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.7', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#334155' }}>
              {result}
            </div>
          </div>
        )}

        {/* フッター */}
        <footer style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
          <p style={{ margin: 0 }}>© 2026 レポートAIチェッカー. All rights reserved.</p>
        </footer>

      </div>
    </div>
  );
}