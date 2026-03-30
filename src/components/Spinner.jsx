export default function Spinner({ size = 36, center = false }) {
  const s = {
    width: size, height: size,
    border: `3px solid var(--surface-low)`,
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin .7s linear infinite',
  }
  if (center) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={s} />
    </div>
  )
  return <div style={s} />
}
