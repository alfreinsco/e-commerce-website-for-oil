'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  adminLoginApi,
  getAdminToken,
  setAdminToken,
  clearAdminToken,
  adminLogoutApi,
  isApiConfigured,
  fetchAdminProfile,
} from '@/lib/api'

export type UserRole = 'customer' | 'admin'

interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  phone?: string
  address?: string
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role?: UserRole) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize default admin and load user from localStorage on mount
  useEffect(() => {
    // Create default admin if not exists
    const adminsJson = localStorage.getItem('admins') || '[]'
    const admins = JSON.parse(adminsJson)
    
    if (admins.length === 0) {
      // Create default admin account
      const defaultAdmin = {
        id: 'admin-1',
        email: 'admin@lamahang.com',
        password: 'admin123', // In production, this should be hashed!
        fullName: 'Administrator',
        role: 'admin' as UserRole,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem('admins', JSON.stringify([defaultAdmin]))
      console.log('Admin default dibuat:')
      console.log('Email: admin@lamahang.com')
      console.log('Password: admin123')
    }

    // Load current user: jika ada admin_token dan API dikonfigurasi, sync profil dari API
    const storedUser = localStorage.getItem('user')
    const token = getAdminToken()
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        if (parsed.role === 'admin' && token && isApiConfigured()) {
          fetchAdminProfile(token).then((res) => {
            if (res?.user) {
              const u = {
                ...parsed,
                fullName: res.user.fullName,
                id: res.user.id,
                createdAt: res.user.createdAt ? new Date(res.user.createdAt) : parsed.createdAt,
              }
              setUser(u)
              localStorage.setItem('user', JSON.stringify(u))
            }
          })
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: UserRole = 'customer') => {
    setIsLoading(true)
    try {
      // Admin: selalu pakai backend (Laravel). Tidak ada fallback ke localStorage.
      if (role === 'admin') {
        if (!isApiConfigured()) {
          throw new Error(
            'Backend belum dikonfigurasi. Tambahkan NEXT_PUBLIC_API_URL di .env.local (mis. http://localhost:8000) dan jalankan server Laravel.'
          )
        }
        const res = await adminLoginApi(email, password)
        const u = {
          id: res.user.id,
          email: res.user.email,
          fullName: res.user.fullName,
          role: 'admin' as UserRole,
          createdAt: res.user.createdAt ? new Date(res.user.createdAt) : new Date(),
        }
        setAdminToken(res.token)
        setUser(u)
        localStorage.setItem('user', JSON.stringify(u))
        return
      }

      // Customer: login dari localStorage
      await new Promise((resolve) => setTimeout(resolve, 300))
      const usersJson = localStorage.getItem('users') || '[]'
      const users = JSON.parse(usersJson)
      const foundUser = users.find(
        (u: any) => u.email === email && u.password === password
      )
      if (!foundUser) {
        throw new Error('Email atau password salah')
      }
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true)
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Get existing users (customers only)
      const usersJson = localStorage.getItem('users') || '[]'
      const users = JSON.parse(usersJson)

      // Get admins to check for duplicate email
      const adminsJson = localStorage.getItem('admins') || '[]'
      const admins = JSON.parse(adminsJson)

      // Check if email already exists in users or admins
      if (users.some((u: any) => u.email === email) || admins.some((a: any) => a.email === email)) {
        throw new Error('Email sudah terdaftar')
      }

      // Create new customer user (register is only for customers)
      const newUser: any = {
        id: Date.now().toString(),
        email,
        password, // In production, this should be hashed!
        fullName,
        role: 'customer',
        phone: '',
        address: '',
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))

      // Login the user
      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    const token = getAdminToken()
    if (token && isApiConfigured()) {
          adminLogoutApi(token).catch(() => {})
        }
    clearAdminToken()
    setUser(null)
    localStorage.removeItem('user')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
