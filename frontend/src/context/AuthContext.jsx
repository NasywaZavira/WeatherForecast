import { createContext, useContext, useState, useEffect } from 'react'
import { apiGetMe, apiLogout } from '../service/apiService'

export const AuthContext = createContext(null)
export function useAuth() { return useContext(AuthContext) }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) 

  useEffect(() => {
    const token = localStorage.getItem('wf_token')
    if (!token) { setLoading(false); return }
    apiGetMe()
      .then(({ user: u }) => setUser(u))
      .catch(() => localStorage.removeItem('wf_token'))
      .finally(() => setLoading(false))
  }, [])

  function logout() {
    apiLogout()   
    setUser(null)
  }


  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}