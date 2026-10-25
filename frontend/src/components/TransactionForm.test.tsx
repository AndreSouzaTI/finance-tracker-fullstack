import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TransactionForm } from './TransactionForm'

describe('TransactionForm', () => {
  it('validates the amount before submitting', async () => {
    const onSubmit = vi.fn()
    render(<TransactionForm defaultDate="2026-05-10" onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Descrição'), 'Mercado')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Informe um valor maior que zero.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('switches categories when the type changes and submits a normalized payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TransactionForm defaultDate="2026-05-10" onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Receita' }))
    expect(screen.getByRole('option', { name: 'Salário' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Alimentação' })).not.toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Descrição'), '  Salário de maio  ')
    await userEvent.type(screen.getByLabelText('Valor (R$)'), '4500,75')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      description: 'Salário de maio',
      amount: 4500.75,
      type: 'INCOME',
      category: 'SALARY',
      date: '2026-05-10',
    })
  })
})
