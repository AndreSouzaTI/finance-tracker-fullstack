import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

/** Tela única para login e cadastro, alternada pela prop mode. */
export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isLogin = mode === 'login'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
      setLoading(false)
    }
  }

  return (
    <main className="auth">
      <form className="card auth__card" onSubmit={handleSubmit}>
        <h1>{isLogin ? 'Finance Tracker' : 'Criar conta'}</h1>
        <p className="muted">{isLogin ? 'Controle suas receitas e despesas' : 'Comece a organizar suas finanças'}</p>

        {!isLogin && (
          <label>
            Nome
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} autoComplete="name" />
          </label>
        )}
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isLogin ? undefined : 8}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
        </label>

        {error && <p className="alert" role="alert">{error}</p>}

        <button className="btn btn--primary" disabled={loading}>
          {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
        </button>
        <p className="muted center">
          {isLogin ? (
            <>Ainda não tem conta? <Link to="/register">Cadastre-se</Link></>
          ) : (
            <>Já tem conta? <Link to="/login">Entrar</Link></>
          )}
        </p>
      </form>
    </main>
  )
}
