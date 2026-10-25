export type TransactionType = 'INCOME' | 'EXPENSE'

export type Category =
  | 'SALARY'
  | 'FREELANCE'
  | 'INVESTMENTS'
  | 'HOUSING'
  | 'FOOD'
  | 'TRANSPORT'
  | 'HEALTH'
  | 'EDUCATION'
  | 'LEISURE'
  | 'OTHER'

export interface Transaction {
  id: number
  description: string
  amount: number
  type: TransactionType
  category: Category
  date: string
}

export type TransactionInput = Omit<Transaction, 'id'>

export interface Page<T> {
  content: T[]
  totalElements: number
}

export interface Dashboard {
  month: string
  income: number
  expense: number
  balance: number
  expensesByCategory: { category: Category; total: number }[]
  lastSixMonths: { month: string; income: number; expense: number }[]
}

export interface Session {
  accessToken: string
  name: string
  expiresAt: number
}
