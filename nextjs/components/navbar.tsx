'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Leaf, ShoppingCart, User, Menu, LogOut, LayoutDashboard, Heart, Home } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@/app/context/cart-context'
import { useAuth } from '@/app/context/auth-context'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { getTotalItems } = useCart()
  const { isAuthenticated, user, logout, isLoading } = useAuth()
  const cartCount = getTotalItems()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Menu navbar untuk semua (Beranda, Produk, Tentang, Kontak)
  const navItems = [
    { href: '/home', label: 'Beranda' },
    { href: '/shop', label: 'Produk' },
    { href: '/about', label: 'Tentang' },
    { href: '/contact', label: 'Kontak' },
  ]

  // Menu dropdown user (Dashboard, Wishlist, Profil)
  const userMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/profile', label: 'Profil', icon: User },
  ]

  const isActive = (href: string) => {
    if (href === '/home') {
      return pathname === '/home' || pathname === '/'
    }
    return pathname === href
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 font-bold text-xl">
            <Leaf className="w-6 h-6 text-primary" />
            <span>Lamahang</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium hover:text-primary transition ${
                  isActive(item.href) ? 'text-primary' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Dropdown */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center cursor-pointer">
                          <Icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-primary" />
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-lg font-medium hover:text-primary transition ${
                        isActive(item.href) ? 'text-primary' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {isAuthenticated && user && (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <div className="mb-4">
                          <p className="text-sm font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        {userMenuItems.map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`flex items-center text-lg font-medium hover:text-primary transition mb-2 ${
                                isActive(item.href) ? 'text-primary' : ''
                              }`}
                            >
                              <Icon className="w-5 h-5 mr-2" />
                              {item.label}
                            </Link>
                          )
                        })}
                        <Button
                          variant="outline"
                          className="w-full justify-start mt-2"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Keluar
                        </Button>
                      </div>
                    </>
                  )}
                  {!isAuthenticated && (
                    <Link href="/login" className="text-lg font-medium hover:text-primary transition">
                      Login
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
