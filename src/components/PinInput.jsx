import { useRef, useState } from 'react'

export default function PinInput({ onComplete, disabled }) {
  const [pin, setPin] = useState('')
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(val)
    if (val.length === 4) onComplete(val)
  }

  const reset = () => setPin('')

  return (
    <div>
      {/* Hidden real input */}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        value={pin}
        onChange={handleChange}
        disabled={disabled}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
        autoFocus
      />

      {/* Visual boxes */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{ display: 'flex', gap: 12, justifyContent: 'center', cursor: 'text' }}
      >
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              width: 60, height: 68,
              borderRadius: 12,
              border: `2px solid ${i === pin.length ? 'var(--primary)' : 'var(--outline)'}`,
              background: 'var(--surface-lowest)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: 'var(--on-surface)',
              transition: 'border-color .15s',
            }}
          >
            {i < pin.length ? '●' : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
