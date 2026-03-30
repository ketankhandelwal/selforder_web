export default function NoTablePage() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 40, textAlign: 'center', minHeight: '100dvh',
      background: 'var(--surface-lowest)',
    }}>
      <div style={{
        width: 80, height: 80, background: 'var(--primary-fixed)',
        borderRadius: 9999, margin: '0 auto 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--on-primary-fixed)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M3 15h18M9 3v18"/>
        </svg>
      </div>
      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)',
        letterSpacing: '-.02em', marginBottom: 6,
      }}>
        SelfOrder
      </div>
      <h2 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700, fontSize: '1.1rem', color: 'var(--on-surface)',
        marginBottom: 10,
      }}>
        Scan to begin
      </h2>
      <p style={{ color: 'var(--on-surface-variant)', fontSize: '.9rem', lineHeight: 1.6, maxWidth: 260 }}>
        Point your camera at the QR code on your table to start ordering.
      </p>
    </div>
  )
}
