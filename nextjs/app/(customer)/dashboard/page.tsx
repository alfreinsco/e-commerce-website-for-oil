'use client'

import { useAuth } from '@/app/context/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Package, ShoppingBag, Users, Leaf, Star } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()

  const Heart = Star

  const stats = [
    { title: 'Total Pesanan', value: '12', icon: ShoppingBag, color: 'text-blue-600' },
    { title: 'Produk Favorit', value: '8', icon: Heart, color: 'text-red-600' },
    { title: 'Total Pengeluaran', value: 'Rp 2.500.000', icon: TrendingUp, color: 'text-green-600' },
    { title: 'Member Sejak', value: '3 Bulan', icon: Users, color: 'text-purple-600' },
  ]

  const recentProducts = [
    { id: 1, name: 'Minyak Kayu Putih 100ml', price: 'Rp 45.000', rating: 4.8 },
    { id: 2, name: 'Minyak Kayu Putih 250ml', price: 'Rp 95.000', rating: 4.9 },
    { id: 3, name: 'Paket Hemat 3 Botol', price: 'Rp 120.000', rating: 4.7 },
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Selamat datang kembali, <span className="text-primary">{user?.fullName?.split(' ')[0] || 'Pengguna'}</span>!
        </h1>
        <p className="text-muted-foreground">Berikut adalah ringkasan aktivitas Anda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-secondary/30 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Featured Products */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Produk Terbaru</CardTitle>
          <CardDescription>Produk pilihan dari Desa Lamahang</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentProducts.map((product) => (
              <div key={product.id} className="border border-border rounded-lg p-4 hover:border-primary transition">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                  <Leaf className="w-12 h-12 text-primary opacity-50" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{product.name}</h3>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-primary">{product.price}</p>
                  <div className="flex items-center gap-1 text-yellow-500 text-sm">
                    <Star className="w-4 h-4 fill-current" />
                    {product.rating}
                  </div>
                </div>
                <Link href="/products">
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    Lihat Detail
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-secondary/20">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Akses Cepat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/products" className="block">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Package className="w-4 h-4" />
                Jelajahi Produk
              </Button>
            </Link>
            <Link href="/orders" className="block">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <ShoppingBag className="w-4 h-4" />
                Lihat Pesanan
              </Button>
            </Link>
            <Link href="/profile" className="block">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Leaf className="w-4 h-4" />
                Kelola Profil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
