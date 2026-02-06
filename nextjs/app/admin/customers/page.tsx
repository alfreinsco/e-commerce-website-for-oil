'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users, Search, Mail, Phone, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Customer {
  id: string
  email: string
  fullName: string
  phone?: string
  role: 'customer'
  createdAt: string
  totalOrders?: number
  totalSpent?: number
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Load customers from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('users')
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers)
        // Filter only customers (not admins)
        const customerList: Customer[] = parsed
          .filter((user: any) => !user.role || user.role === 'customer')
          .map((user: any) => ({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone || '',
            role: 'customer' as const,
            createdAt: user.createdAt,
            totalOrders: Math.floor(Math.random() * 10), // Mock data
            totalSpent: Math.floor(Math.random() * 1000000), // Mock data
          }))
        setCustomers(customerList)
      } catch (error) {
        console.error('Failed to parse stored users:', error)
      }
    }
  }, [])

  const filteredCustomers = customers.filter((customer) =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Kelola Pelanggan</h1>
        <p className="text-muted-foreground">Lihat daftar semua pelanggan yang terdaftar</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pelanggan</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pelanggan Aktif</p>
                <p className="text-2xl font-bold">{customers.filter((c) => (c.totalOrders || 0) > 0).length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                <p className="text-2xl font-bold">
                  {formatPrice(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Cari pelanggan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{customer.fullName}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {customer.email}
                  </CardDescription>
                </div>
                {(customer.totalOrders || 0) > 0 && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Aktif
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Bergabung {new Date(customer.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="pt-2 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Pesanan</span>
                    <span className="font-medium">{customer.totalOrders || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Belanja</span>
                    <span className="font-medium text-primary">{formatPrice(customer.totalSpent || 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada pelanggan</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Tidak ada pelanggan yang sesuai dengan pencarian' : 'Belum ada pelanggan yang terdaftar'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
