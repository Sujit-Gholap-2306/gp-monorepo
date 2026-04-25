const PAISE_PER_RUPEE = 100

function parseRupees(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value.trim())
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid rupee amount: "${String(value)}"`)
  }
  return parsed
}

export function toPaise(rupees: number | string): number {
  const value = parseRupees(rupees)
  const paise = Math.round(value * PAISE_PER_RUPEE)
  if (!Number.isSafeInteger(paise)) {
    throw new Error('Paise value exceeds safe integer range')
  }
  return paise
}

export function fromPaise(paise: number | bigint): number {
  if (typeof paise === 'bigint') {
    return Number(paise) / PAISE_PER_RUPEE
  }
  if (!Number.isFinite(paise)) {
    throw new Error(`Invalid paise amount: "${String(paise)}"`)
  }
  return paise / PAISE_PER_RUPEE
}

export function assertNonNegativePaise(amountPaise: number | bigint, field = 'amount_paise') {
  const value = typeof amountPaise === 'bigint' ? amountPaise : BigInt(Math.trunc(amountPaise))
  if (value < 0n) {
    throw new Error(`${field} must be >= 0`)
  }
}

