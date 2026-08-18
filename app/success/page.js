'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchCode = async () => {
      try {
        const res = await fetch(`/api/get-passcode?session_id=${sessionId}`);
        const data = await res.json();
        if (data.passcode) {
          setPasscode(data.passcode);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, [sessionId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(passcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '60px 16px', fontFamily: 'sans-serif', textAlign: 'center', color: '#1e293b' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '24px', fontWeight: 'bold' }}>
          ✓
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#0f172a' }}>
          ご購入ありがとうございます！
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0' }}>
          10,000文字推敲プレミアムチケットが発行されました。
        </p>

        <div style={{ backgroundColor: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>あなたのプレミアムパスコード</span>
          {loading ? (
            <span style={{ fontSize: '16px', color: '#64748b' }}>コードを発行中...</span>
          ) : passcode ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '4px', color: '#4f46e5' }}>{passcode}</span>
              <button
                onClick={handleCopy}
                style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: copied ? '#15803d' : '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                {copied ? 'コピー完了！' : 'コピー'}
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '13px', color: '#ef4444' }}>コードの取得に失敗しました。画面を再読み込みしてください。</span>
          )}
        </div>

        <a
          href="/"
          style={{ display: 'inline-block', backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none' }}
        >
          チェッカーに戻って使う →
        </a>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}