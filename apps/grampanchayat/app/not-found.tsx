export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>404</h1>
      <p style={{ color: 'var(--color-gp-muted)' }}>ग्रामपंचायत सापडली नाही</p>
      <p style={{ color: 'var(--color-gp-muted)', fontSize: '0.875rem' }}>GP not found</p>
    </div>
  )
}
