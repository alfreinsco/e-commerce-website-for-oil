'use client'

import React from "react"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/auth-context'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { useIsMobile } from '@/hooks/use-mobile'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isLoading) {
      // Jika admin mencoba akses customer routes, redirect ke admin dashboard
      if (isAuthenticated && isAdmin) {
        router.push('/admin/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, router])

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <footer className="border-t py-6 bg-muted/30 hidden lg:block">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Desa Lamahang. Semua hak dilindungi.</p>
        </div>
      </footer>
      {/* Bottom Navigation - Mobile only */}
      {isMobile && <BottomNav />}
    </div>
  )
}
