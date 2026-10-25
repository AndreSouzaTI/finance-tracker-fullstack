import { describe, expect, it } from 'vitest'
import { categoriesFor, formatCurrency, formatDate, shiftMonth } from './format'

describe('format', () => {
  it('formats values as Brazilian reais', () => {
    expect(formatCurrency(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50')
  })

  it('formats ISO dates without timezone shifts', () => {
    expect(formatDate('2026-01-01')).toBe('01/01/2026')
  })

  it('shifts months across year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2025-12', 1)).toBe('2026-01')
  })

  it('lists only the categories that match the transaction type', () => {
    expect(categoriesFor('INCOME')).toEqual(['SALARY', 'FREELANCE', 'INVESTMENTS', 'OTHER'])
    expect(categoriesFor('EXPENSE')).not.toContain('SALARY')
  })
})
