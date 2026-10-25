import { useState, type FormEvent } from 'react'
import type { Category, Transaction, TransactionInput, TransactionType } from '../api/types'
import { CATEGORY_INFO, categoriesFor } from '../utils/format'

interface Props {
  initial?: Transaction | null
  defaultDate: string
  onSubmit: (input: TransactionInput) => Promise<void>
  onCancel: () => void
}

export function TransactionForm({ initial, defaultDate, onSubmit, onCancel }: Props) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'EXPENSE')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState<Category>(initial?.category ?? 'FOOD')
  const [date, setDate] = useState(initial?.date ?? defaultDate)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const categories = categoriesFor(type)

  function changeType(next: TransactionType) {
    setType(next)
    // Mantém a categoria só se ela também valer para o novo tipo
    if (!categoriesFor(next).includes(category)) {
      setCategory(next === 'INCOME' ? 'SALARY' : 'FOOD')
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(amount.replace(',', '.'))
    if (!description.trim()) {
      setError('Informe uma descrição.')
      return
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError('Informe um valor maior que zero.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ description: description.trim(), amount: value, type, category, date })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
      setSaving(false)
    }
  }

  return (
    <>
      <div className="backdrop" onClick={onCancel} />
      <form className="card modal" onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-label="Lançamento">
        <h2>{initial ? 'Editar lançamento' : 'Novo lançamento'}</h2>

        <div className="segmented" role="radiogroup" aria-label="Tipo">
          {(['EXPENSE', 'INCOME'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={type === t}
              className={type === t ? `active ${t.toLowerCase()}` : ''}
              onClick={() => changeType(t)}
            >
              {t === 'EXPENSE' ? 'Despesa' : 'Receita'}
            </button>
          ))}
        </div>

        <label>
          Descrição
          <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={140} autoFocus />
        </label>
        <div className="row">
          <label>
            Valor (R$)
            <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
          </label>
          <label>
            Data
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
        </div>
        <label>
          Categoria
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_INFO[c].label}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="alert" role="alert">{error}</p>}

        <div className="actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn--primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </>
  )
}
