import { useState } from 'react'

interface User {
  id: string
  nome: string
  email: string
  createdAt: string
}

interface AuthResponse {
  message: string
  user: User
  token: string
}

interface ErrorResponse {
  error: string
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cadastrar = async (nome: string, email: string, senha: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro no cadastro')
      }

      // O token já é salvo automaticamente como cookie pelo servidor
      // Não precisamos fazer nada aqui
      console.log("Cadastro realizado com sucesso:", data);

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, senha: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro no login')
      }

      // Não redirecionar automaticamente - deixar o componente decidir
      console.log("useAuth: Login realizado com sucesso");
      // window.location.href = '/views/home'

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const getCurrentUser = (): User | null => {
    if (typeof window === 'undefined') return null

    const userStr = localStorage.getItem('user')
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  const isAuthenticated = (): boolean => {
    return getToken() !== null
  }

  return {
    cadastrar,
    login,
    logout,
    getCurrentUser,
    getToken,
    isAuthenticated,
    isLoading,
    error,
  }
}
