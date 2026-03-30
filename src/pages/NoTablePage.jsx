export default function NoTablePage() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 40, textAlign: 'center', minHeight: '100dvh',
    }}>
      <div style={{ fontSize: 72, marginBottom: 24 }}>📱</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--on-surface)' }}>
        Scan the QR Code
      </h2>
      <p style={{ marginTop: 12, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
        Point your camera at the QR code<br />on your table to get started.
      </p>
      <div style={{
        marginTop: 40, padding: '16px 24px',
        background: 'var(--surface-low)', borderRadius: 16,
        fontSize: '1.5rem', letterSpacing: 2,
        color: 'var(--primary)', fontWeight: 800,
      }}>
        SelfOrder 🍽️
      </div>
    </div>
  )
}
