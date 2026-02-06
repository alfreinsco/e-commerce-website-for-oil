'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShoppingBag, Search, Eye, Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: Array<{
    id: number
    name: string
    quantity: number
    price: number
  }>
  address: {
    label: string
    recipientName: string
    phone: string
    detailAddress: string
    village: string
    district: string
    regency: string
    province: string
    postalCode: string
  }
  paymentMethod: string
  subtotal: number
  voucherDiscount: number
  shippingCost: number
  tax: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
  createdAt: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Load orders from localStorage
  useEffect(() => {
    const storedOrders = localStorage.getItem('admin_orders')
    if (storedOrders) {
      try {
        const parsed = JSON.parse(storedOrders)
        setOrders(parsed)
      } catch (error) {
        console.error('Failed to parse stored orders:', error)
      }
    } else {
      // Initialize with sample orders
      const sampleOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '081234567890',
          items: [
            { id: 1, name: 'Minyak Kayu Putih 100ml', quantity: 2, price: 45000 },
            { id: 2, name: 'Minyak Kayu Putih 250ml', quantity: 1, price: 95000 },
          ],
          address: {
            label: 'Rumah',
            recipientName: 'John Doe',
            phone: '081234567890',
            detailAddress: 'Jl. Raya No. 123',
            village: 'Desa Lamahang',
            district: 'Kec. Waplau',
            regency: 'Kab. Buru',
            province: 'Maluku',
            postalCode: '97511',
          },
          paymentMethod: 'bank_transfer',
          subtotal: 185000,
          voucherDiscount: 0,
          shippingCost: 35000,
          tax: 20350,
          total: 240350,
          status: 'pending',
          notes: 'Tolong dikirim cepat',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          customerPhone: '081987654321',
          items: [
            { id: 3, name: 'Paket Hemat 3 Botol 100ml', quantity: 1, price: 120000 },
          ],
          address: {
            label: 'Kantor',
            recipientName: 'Jane Smith',
            phone: '081987654321',
            detailAddress: 'Jl. Sudirman No. 456',
            village: 'Kelurahan Menteng',
            district: 'Kec. Menteng',
            regency: 'Jakarta Pusat',
            province: 'DKI Jakarta',
            postalCode: '10310',
          },
          paymentMethod: 'e_wallet',
          subtotal: 120000,
          voucherDiscount: 12000,
          shippingCost: 0,
          tax: 11880,
          total: 119880,
          status: 'processing',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]
      setOrders(sampleOrders)
      localStorage.setItem('admin_orders', JSON.stringify(sampleOrders))
    }
  }, [])

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
    localStorage.setItem('admin_orders', JSON.stringify(orders))
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800', icon: Package },
      processing: { label: 'Diproses', color: 'bg-blue-100 text-blue-800', icon: Package },
      shipped: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { label: 'Selesai', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: XCircle },
    }
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getStatusOptions = (currentStatus: Order['status']) => {
    const statusFlow: Record<Order['status'], Order['status'][]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    }
    return statusFlow[currentStatus] || []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Kelola Pesanan</h1>
        <p className="text-muted-foreground">Lihat dan kelola semua pesanan pelanggan</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Cari pesanan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="processing">Diproses</SelectItem>
            <SelectItem value="shipped">Dikirim</SelectItem>
            <SelectItem value="delivered">Selesai</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    {order.orderNumber}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {order.customerName} • {order.customerEmail}
                  </CardDescription>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tanggal</p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Items</p>
                    <p className="font-medium">{order.items.length} produk</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium text-primary">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pembayaran</p>
                    <p className="font-medium capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Detail Pesanan - {order.orderNumber}</DialogTitle>
                        <DialogDescription>
                          Informasi lengkap pesanan pelanggan
                        </DialogDescription>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="space-y-6 mt-4">
                          {/* Customer Info */}
                          <div>
                            <h3 className="font-semibold mb-3">Informasi Pelanggan</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Nama</p>
                                <p className="font-medium">{selectedOrder.customerName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{selectedOrder.customerEmail}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Telepon</p>
                                <p className="font-medium">{selectedOrder.customerPhone}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Metode Pembayaran</p>
                                <p className="font-medium capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</p>
                              </div>
                            </div>
                          </div>

                          {/* Address */}
                          <div>
                            <h3 className="font-semibold mb-3">Alamat Pengiriman</h3>
                            <div className="bg-muted/30 rounded-lg p-4 text-sm">
                              <p className="font-medium mb-2">{selectedOrder.address.label}</p>
                              <p>{selectedOrder.address.recipientName}</p>
                              <p>{selectedOrder.address.phone}</p>
                              <p className="mt-2">{selectedOrder.address.detailAddress}</p>
                              <p>
                                {selectedOrder.address.village}, {selectedOrder.address.district}, {selectedOrder.address.regency}, {selectedOrder.address.province} {selectedOrder.address.postalCode}
                              </p>
                            </div>
                          </div>

                          {/* Items */}
                          <div>
                            <h3 className="font-semibold mb-3">Produk Dipesan</h3>
                            <div className="space-y-2">
                              {selectedOrder.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Summary */}
                          <div>
                            <h3 className="font-semibold mb-3">Ringkasan</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatPrice(selectedOrder.subtotal)}</span>
                              </div>
                              {selectedOrder.voucherDiscount > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Diskon Voucher</span>
                                  <span className="text-green-600">-{formatPrice(selectedOrder.voucherDiscount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Ongkos Kirim</span>
                                <span>{formatPrice(selectedOrder.shippingCost)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Pajak (PPN 11%)</span>
                                <span>{formatPrice(selectedOrder.tax)}</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                              </div>
                            </div>
                          </div>

                          {selectedOrder.notes && (
                            <div>
                              <h3 className="font-semibold mb-3">Catatan</h3>
                              <p className="text-sm bg-muted/30 rounded-lg p-3">{selectedOrder.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {getStatusOptions(order.status).length > 0 && (
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getStatusOptions(order.status).map((status) => {
                          const statusLabels: Record<Order['status'], string> = {
                            pending: 'Menunggu',
                            processing: 'Diproses',
                            shipped: 'Dikirim',
                            delivered: 'Selesai',
                            cancelled: 'Dibatalkan',
                          }
                          return (
                            <SelectItem key={status} value={status}>
                              Ubah ke {statusLabels[status]}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada pesanan</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'Tidak ada pesanan yang sesuai dengan filter' : 'Belum ada pesanan'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
