'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Package, TrendingUp } from 'lucide-react'

const ORDERS = [
  {
    id: 'ORD-001',
    date: '2024-02-01',
    product: 'Minyak Kayu Putih 250ml',
    quantity: 2,
    total: 190000,
    status: 'Delivered',
    statusColor: 'bg-green-100 text-green-800',
  },
  {
    id: 'ORD-002',
    date: '2024-01-28',
    product: 'Paket Hemat 3 Botol 100ml',
    quantity: 1,
    total: 120000,
    status: 'Delivered',
    statusColor: 'bg-green-100 text-green-800',
  },
  {
    id: 'ORD-003',
    date: '2024-01-20',
    product: 'Minyak Kayu Putih Premium 250ml',
    quantity: 1,
    total: 125000,
    status: 'Processing',
    statusColor: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'ORD-004',
    date: '2024-01-15',
    product: 'Travel Size 30ml',
    quantity: 5,
    total: 125000,
    status: 'Delivered',
    statusColor: 'bg-green-100 text-green-800',
  },
  {
    id: 'ORD-005',
    date: '2024-01-10',
    product: 'Minyak Kayu Putih Organik 100ml',
    quantity: 2,
    total: 170000,
    status: 'Delivered',
    statusColor: 'bg-green-100 text-green-800',
  },
]

export default function OrdersPage() {
  const deliveredCount = ORDERS.filter((o) => o.status === 'Delivered').length
  const totalSpent = ORDERS.reduce((sum, o) => sum + o.total, 0)

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      Delivered: 'Terkirim',
      Processing: 'Diproses',
      Shipped: 'Dalam Pengiriman',
      Pending: 'Menunggu',
    }
    return labels[status] || status
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Pesanan Saya</h1>
        <p className="text-muted-foreground">Kelola dan pantau semua pesanan Anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Pesanan</p>
                <p className="text-2xl font-bold">{ORDERS.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 text-primary">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Terkirim</p>
                <p className="text-2xl font-bold">{deliveredCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 text-green-600">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(totalSpent)}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 text-primary">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Riwayat Pesanan</CardTitle>
          <CardDescription>Daftar lengkap semua pesanan Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ORDERS.map((order) => (
              <div key={order.id} className="border border-border rounded-lg p-4 hover:border-primary transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{order.id}</h3>
                      <Badge className={order.statusColor}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{order.product}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.date)} • Qty: {order.quantity}
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end md:justify-between">
                    <p className="font-bold text-primary text-lg mb-3 md:mb-4">{formatPrice(order.total)}</p>
                    <Button variant="outline" size="sm">
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
