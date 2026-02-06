'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign,
  Shield
} from 'lucide-react'

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Produk', value: '24', icon: Package, color: 'text-blue-600' },
    { title: 'Total Pesanan', value: '156', icon: ShoppingBag, color: 'text-green-600' },
    { title: 'Total Pelanggan', value: '1,234', icon: Users, color: 'text-purple-600' },
    { title: 'Total Pendapatan', value: 'Rp 125.000.000', icon: DollarSign, color: 'text-orange-600' },
  ]

  return (
    <div className="space-y-8">
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

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Manajemen</CardTitle>
            <CardDescription>Kelola produk, pesanan, dan pengguna</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="w-full justify-start gap-2" disabled>
                <Package className="w-4 h-4" />
                Kelola Produk
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" disabled>
                <ShoppingBag className="w-4 h-4" />
                Kelola Pesanan
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" disabled>
                <Users className="w-4 h-4" />
                Kelola Pengguna
              </Button>
            </div>
          </CardContent>
        </Card>

      {/* Info Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-secondary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Panel Admin</h3>
              <p className="text-sm text-muted-foreground">
                Fitur manajemen lengkap akan segera tersedia. Saat ini Anda dapat melihat 
                statistik dashboard dan mengelola akun admin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
