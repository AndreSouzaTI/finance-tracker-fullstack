import type { Category, TransactionType } from '../api/types'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatCurrency(value: number): string {
  return currency.format(value)
}

/** "2026-05" -> "mai/26" */
export function formatMonthShort(month: string): string {
  const [year, m] = month.split('-').map(Number)
  const label = new Date(year, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  return `${label}/${String(year).slice(2)}`
}

/** "2026-05" -> "Maio de 2026" */
export function formatMonthLong(month: string): string {
  const [year, m] = month.split('-').map(Number)
  const label = new Date(year, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** "2026-05-10" -> "10/05/2026" sem conversão de fuso horário */
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number)
  const date = new Date(year, m - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function currentMonth(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

export const CATEGORY_INFO: Record<Category, { label: string; color: string; type: TransactionType | null }> = {
  SALARY: { label: 'Salário', color: '#16a34a', type: 'INCOME' },
  FREELANCE: { label: 'Freelance', color: '#22c55e', type: 'INCOME' },
  INVESTMENTS: { label: 'Investimentos', color: '#4ade80', type: 'INCOME' },
  HOUSING: { label: 'Moradia', color: '#6366f1', type: 'EXPENSE' },
  FOOD: { label: 'Alimentação', color: '#f59e0b', type: 'EXPENSE' },
  TRANSPORT: { label: 'Transporte', color: '#0ea5e9', type: 'EXPENSE' },
  HEALTH: { label: 'Saúde', color: '#ef4444', type: 'EXPENSE' },
  EDUCATION: { label: 'Educação', color: '#8b5cf6', type: 'EXPENSE' },
  LEISURE: { label: 'Lazer', color: '#ec4899', type: 'EXPENSE' },
  OTHER: { label: 'Outros', color: '#94a3b8', type: null },
}

export function categoriesFor(type: TransactionType): Category[] {
  return (Object.keys(CATEGORY_INFO) as Category[]).filter((c) => {
    const allowed = CATEGORY_INFO[c].type
    return allowed === null || allowed === type
  })
}
