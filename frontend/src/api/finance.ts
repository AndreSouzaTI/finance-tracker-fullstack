import { api } from './client'
import type { Dashboard, Page, Transaction, TransactionInput, TransactionType } from './types'

export function fetchDashboard(month: string): Promise<Dashboard> {
  return api(`/dashboard?month=${month}`)
}

export function fetchTransactions(month: string, type?: TransactionType): Promise<Page<Transaction>> {
  const params = new URLSearchParams({ month, size: '200' })
  if (type) params.set('type', type)
  return api(`/transactions?${params}`)
}

export function saveTransaction(input: TransactionInput, id?: number): Promise<Transaction> {
  return api(id ? `/transactions/${id}` : '/transactions', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteTransaction(id: number): Promise<void> {
  return api(`/transactions/${id}`, { method: 'DELETE' })
}
