const SESSION_KEY = 'finance-tracker.session'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function getToken(): string | null {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
    return session && session.expiresAt > Date.now() ? session.accessToken : null
  } catch {
    return null
  }
}

export const sessionStorageKey = SESSION_KEY

/** Evento disparado quando a API recusa o token, para o AuthProvider encerrar a sessão. */
export const UNAUTHORIZED_EVENT = 'finance:unauthorized'

/** fetch com JSON, token JWT e mensagens de erro vindas do Problem Details da API. */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && !path.startsWith('/auth/') ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (response.status === 401 && token) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }
  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    const fieldError = problem?.errors ? Object.values(problem.errors)[0] : undefined
    throw new ApiError(response.status, (fieldError as string) ?? problem?.detail ?? 'Erro inesperado. Tente novamente.')
  }
  return response.status === 204 ? (undefined as T) : response.json()
}
