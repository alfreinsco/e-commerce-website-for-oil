'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/context/auth-context'
import {
  Home,
  Package,
  Info,
  Mail,
  ShoppingCart,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/app/context/cart-context'

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const { getTotalItems } = useCart()
  const cartCount = getTotalItems()

  const navItems = [
    { href: '/home', label: 'Beranda', icon: Home },
    { href: '/shop', label: 'Produk', icon: Package },
    { href: '/about', label: 'Tentang', icon: Info },
    { href: '/contact', label: 'Kontak', icon: Mail },
  ]

  const isActive = (href?: string) => {
    if (href === '/home') {
      return pathname === '/home' || pathname === '/'
    }
    return href && pathname === href
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border h-20 lg:hidden z-50">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link key={item.href} href={item.href} className="flex-1 h-full">
              <div
                className={`flex flex-col items-center justify-center gap-1 h-full ${
                  active
                    ? 'bg-secondary/40'
                    : 'hover:bg-secondary/30 transition-colors'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
        
        {/* Cart Button */}
        <Link href="/cart" className="flex-1 h-full">
          <div className="flex flex-col items-center justify-center gap-1 h-full hover:bg-secondary/30 transition-colors relative">
            <div className="relative">
              <ShoppingCart
                className={`w-5 h-5 transition-colors ${
                  pathname === '/cart' ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span
              className={`text-xs font-medium transition-colors ${
                pathname === '/cart'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Keranjang
            </span>
          </div>
        </Link>

        {/* User Button */}
        {isAuthenticated ? (
          <Link href="/profile" className="flex-1 h-full">
            <div
              className={`flex flex-col items-center justify-center gap-1 h-full ${
                pathname === '/profile'
                  ? 'bg-secondary/40'
                  : 'hover:bg-secondary/30 transition-colors'
              }`}
            >
              <User
                className={`w-5 h-5 transition-colors ${
                  pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  pathname === '/profile'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                Profil
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/login" className="flex-1 h-full">
            <div className="flex flex-col items-center justify-center gap-1 h-full hover:bg-secondary/30 transition-colors">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Login
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
