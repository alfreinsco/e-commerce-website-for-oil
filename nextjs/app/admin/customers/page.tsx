'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users, Search, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAdminToken, isApiConfigured, customersGet } from '@/lib/api'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isApiConfigured() && getAdminToken()) {
      setLoading(true)
      customersGet(getAdminToken())
        .then((list) => {
          setCustomers(
            list.map((c) => ({
              id: c.id,
              email: c.email,
              fullName: c.fullName,
              phone: c.phone ?? undefined,
              role: 'customer' as const,
              createdAt: c.createdAt ?? '',
              totalOrders: c.totalOrders,
              totalSpent: c.totalSpent,
            }))
          )
        })
        .catch(() => {
          try {
            const stored = localStorage.getItem('users')
            if (stored) {
              const parsed = JSON.parse(stored)
              const customerList: Customer[] = parsed
                .filter((u: { role?: string }) => !u.role || u.role === 'customer')
                .map((u: { id: string; email: string; fullName?: string; phone?: string; createdAt?: string }) => ({
                  id: String(u.id),
                  email: u.email,
                  fullName: u.fullName ?? '',
                  phone: u.phone ?? undefined,
                  role: 'customer' as const,
                  createdAt: u.createdAt ?? '',
                  totalOrders: 0,
                  totalSpent: 0,
                }))
              setCustomers(customerList)
            }
          } catch {
            // ignore
          }
        })
        .finally(() => setLoading(false))
      return
    }
    try {
      const stored = localStorage.getItem('users')
      if (stored) {
        const parsed = JSON.parse(stored)
        const customerList: Customer[] = parsed
          .filter((u: { role?: string }) => !u.role || u.role === 'customer')
          .map((u: { id: string; email: string; fullName?: string; phone?: string; createdAt?: string }) => ({
            id: String(u.id),
            email: u.email,
            fullName: u.fullName ?? '',
            phone: u.phone ?? undefined,
            role: 'customer' as const,
            createdAt: u.createdAt ?? '',
            totalOrders: 0,
            totalSpent: 0,
          }))
        setCustomers(customerList)
      }
    } catch (error) {
      console.error('Failed to parse stored users:', error)
    }
    setLoading(false)
  }, [])

  const filteredCustomers = customers.filter((customer) =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
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
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Cari pelanggan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada pelanggan</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Tidak ada pelanggan yang sesuai dengan pencarian'
                  : 'Belum ada pelanggan yang terdaftar'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead className="text-center">Total Pesanan</TableHead>
                  <TableHead className="text-right">Total Belanja</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                    <TableCell>{customer.phone || '–'}</TableCell>
                    <TableCell>
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString('id-ID')
                        : '–'}
                    </TableCell>
                    <TableCell className="text-center">{customer.totalOrders ?? 0}</TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatPrice(customer.totalSpent ?? 0)}
                    </TableCell>
                    <TableCell>
                      {(customer.totalOrders ?? 0) > 0 ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Aktif
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">–</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
