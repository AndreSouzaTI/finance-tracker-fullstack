import { useCallback, useEffect, useState } from 'react'
import { deleteTransaction, fetchDashboard, fetchTransactions, saveTransaction } from '../api/finance'
import type { Dashboard, Transaction, TransactionInput, TransactionType } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { CategoryChart, MonthlyChart } from '../components/Charts'
import { TransactionForm } from '../components/TransactionForm'
import { CATEGORY_INFO, currentMonth, formatCurrency, formatDate, formatMonthLong, shiftMonth } from '../utils/format'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const [month, setMonth] = useState(currentMonth)
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('')
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  // Incrementar a versão força uma nova busca depois de salvar ou excluir
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let active = true
    Promise.all([fetchDashboard(month), fetchTransactions(month, typeFilter || undefined)])
      .then(([summary, page]) => {
        if (!active) return
        setDashboard(summary)
        setTransactions(page.content)
        setError(null)
      })
      .catch((err) => active && setError(err instanceof Error ? err.message : 'Erro ao carregar os dados.'))
    // Descarta respostas de buscas antigas quando o mês muda rápido
    return () => {
      active = false
    }
  }, [month, typeFilter, version])

  async function handleSave(input: TransactionInput) {
    await saveTransaction(input, editing?.id)
    closeForm()
    reload()
  }

  async function handleDelete(transaction: Transaction) {
    if (!confirm(`Excluir "${transaction.description}"?`)) return
    await deleteTransaction(transaction.id).catch((err) => setError(err.message))
    reload()
  }

  function openForm(transaction: Transaction | null) {
    setEditing(transaction)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  const today = `${currentMonth()}-${String(new Date().getDate()).padStart(2, '0')}`
  const defaultDate = today.startsWith(month) ? today : `${month}-01`

  return (
    <>
      <header className="topbar">
        <strong className="brand">Finance Tracker</strong>
        <div className="topbar__user">
          <span className="muted">Olá, {user?.name}</span>
          <button className="btn btn--ghost" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <main className="page">
        <section className="toolbar">
          <div className="month-picker">
            <button className="icon-btn" aria-label="Mês anterior" onClick={() => setMonth((m) => shiftMonth(m, -1))}>
              ‹
            </button>
            <h1>{formatMonthLong(month)}</h1>
            <button className="icon-btn" aria-label="Próximo mês" onClick={() => setMonth((m) => shiftMonth(m, 1))}>
              ›
            </button>
          </div>
          <button className="btn btn--primary" onClick={() => openForm(null)}>
            + Novo lançamento
          </button>
        </section>

        {error && <p className="alert" role="alert">{error}</p>}

        {dashboard && (
          <>
            <section className="summary">
              <div className="card summary__card">
                <span className="muted">Receitas</span>
                <strong className="income">{formatCurrency(dashboard.income)}</strong>
              </div>
              <div className="card summary__card">
                <span className="muted">Despesas</span>
                <strong className="expense">{formatCurrency(dashboard.expense)}</strong>
              </div>
              <div className="card summary__card">
                <span className="muted">Saldo do mês</span>
                <strong className={dashboard.balance >= 0 ? 'income' : 'expense'}>{formatCurrency(dashboard.balance)}</strong>
              </div>
            </section>

            <section className="charts">
              <div className="card">
                <h2>Despesas por categoria</h2>
                <CategoryChart data={dashboard.expensesByCategory} />
              </div>
              <div className="card">
                <h2>Últimos 6 meses</h2>
                <MonthlyChart data={dashboard.lastSixMonths} />
              </div>
            </section>
          </>
        )}

        <section className="card">
          <div className="table-header">
            <h2>Lançamentos</h2>
            <select
              aria-label="Filtrar por tipo"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TransactionType | '')}
            >
              <option value="">Todos</option>
              <option value="INCOME">Receitas</option>
              <option value="EXPENSE">Despesas</option>
            </select>
          </div>
          {transactions.length === 0 ? (
            <p className="muted empty">Nenhum lançamento neste mês</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th className="right">Valor</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{formatDate(t.date)}</td>
                      <td>{t.description}</td>
                      <td>
                        <span className="dot" style={{ background: CATEGORY_INFO[t.category].color }} />
                        {CATEGORY_INFO[t.category].label}
                      </td>
                      <td className={`right ${t.type === 'INCOME' ? 'income' : 'expense'}`}>
                        {t.type === 'INCOME' ? '+' : '−'} {formatCurrency(t.amount)}
                      </td>
                      <td className="right nowrap">
                        <button className="link-btn" onClick={() => openForm(t)}>
                          Editar
                        </button>
                        <button className="link-btn link-btn--danger" onClick={() => handleDelete(t)}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {formOpen && (
        <TransactionForm initial={editing} defaultDate={defaultDate} onSubmit={handleSave} onCancel={closeForm} />
      )}
    </>
  )
}
