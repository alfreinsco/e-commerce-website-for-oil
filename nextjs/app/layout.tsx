import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { AuthProvider } from '@/app/context/auth-context'
import { CartProvider } from '@/app/context/cart-context'
import { WishlistProvider } from '@/app/context/wishlist-context'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Minyak Kayu Putih Lamahang - Produk Alami Berkualitas',
  description: 'Penjualan minyak kayu putih premium dari Desa Lamahang, Kabupaten Buru, Maluku, Indonesia. Produk alami berkhasiat untuk kesehatan keluarga Anda.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
