const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')

export async function apiRequest(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('klay_token') : null
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers
    }
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}
