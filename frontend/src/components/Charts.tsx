import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Dashboard } from '../api/types'
import { CATEGORY_INFO, formatCurrency, formatMonthShort } from '../utils/format'

const tooltipFormatter = (value: unknown) => formatCurrency(Number(value))

export function CategoryChart({ data }: { data: Dashboard['expensesByCategory'] }) {
  if (data.length === 0) {
    return <p className="muted empty">Nenhuma despesa neste mês</p>
  }
  const rows = data.map((d) => ({ name: CATEGORY_INFO[d.category].label, value: d.total, color: CATEGORY_INFO[d.category].color }))
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
          {rows.map((row) => (
            <Cell key={row.name} fill={row.color} />
          ))}
        </Pie>
        <Tooltip formatter={tooltipFormatter} />
        <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function MonthlyChart({ data }: { data: Dashboard['lastSixMonths'] }) {
  const rows = data.map((d) => ({ ...d, label: formatMonthShort(d.month) }))
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={70} tickFormatter={(v) => `R$ ${Number(v) / 1000}k`} />
        <Tooltip formatter={tooltipFormatter} />
        <Legend iconType="circle" />
        <Bar dataKey="income" name="Receitas" fill="#16a34a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
