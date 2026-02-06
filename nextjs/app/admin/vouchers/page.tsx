'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Ticket, Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAdminToken, isApiConfigured, vouchersGet, voucherCreate, voucherUpdate, voucherDelete } from '@/lib/api'

export type VoucherType = 'percentage' | 'fixed' | 'free_shipping'

export interface Voucher {
  id: string
  code: string
  type: VoucherType
  discount: number
  minPurchase: number
  description?: string
  validFrom?: string
  validTo?: string
  usageLimit?: number
  usedCount: number
  isActive: boolean
}

const DEFAULT_VOUCHERS: Voucher[] = [
  { id: '1', code: 'DISKON10', type: 'percentage', discount: 10, minPurchase: 50000, usedCount: 0, isActive: true },
  { id: '2', code: 'DISKON20', type: 'percentage', discount: 20, minPurchase: 100000, usedCount: 0, isActive: true },
  { id: '3', code: 'FREESHIP', type: 'free_shipping', discount: 0, minPurchase: 0, usedCount: 0, isActive: true },
  { id: '4', code: 'CASHBACK50K', type: 'fixed', discount: 50000, minPurchase: 200000, usedCount: 0, isActive: true },
]

const STORAGE_KEY = 'admin_vouchers'

function apiToVoucher(a: {
  id: string
  code: string
  type: string
  discount: number
  minPurchase: number
  description?: string | null
  validFrom?: string | null
  validTo?: string | null
  usageLimit?: number | null
  usedCount: number
  isActive: boolean
}): Voucher {
  return {
    id: a.id,
    code: a.code,
    type: a.type as VoucherType,
    discount: a.discount,
    minPurchase: a.minPurchase,
    description: a.description ?? undefined,
    validFrom: a.validFrom ?? undefined,
    validTo: a.validTo ?? undefined,
    usageLimit: a.usageLimit ?? undefined,
    usedCount: a.usedCount,
    isActive: a.isActive,
  }
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as VoucherType,
    discount: '',
    minPurchase: '',
    description: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
    isActive: true,
  })

  useEffect(() => {
    if (isApiConfigured() && getAdminToken()) {
      setLoading(true)
      vouchersGet(getAdminToken())
        .then((list) => setVouchers(list.map(apiToVoucher)))
        .catch(() => {
          try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) setVouchers(JSON.parse(stored))
            else setVouchers(DEFAULT_VOUCHERS)
          } catch {
            setVouchers(DEFAULT_VOUCHERS)
          }
        })
        .finally(() => setLoading(false))
      return
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setVouchers(JSON.parse(stored))
      } catch {
        setVouchers(DEFAULT_VOUCHERS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VOUCHERS))
      }
    } else {
      setVouchers(DEFAULT_VOUCHERS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VOUCHERS))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (vouchers.length > 0 && (!isApiConfigured() || !getAdminToken())) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vouchers))
    }
  }, [vouchers])

  const handleAdd = () => {
    setEditingVoucher(null)
    setFormData({
      code: '',
      type: 'percentage',
      discount: '',
      minPurchase: '',
      description: '',
      validFrom: '',
      validTo: '',
      usageLimit: '',
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (v: Voucher) => {
    setEditingVoucher(v)
    setFormData({
      code: v.code,
      type: v.type,
      discount: v.type === 'free_shipping' ? '' : String(v.discount),
      minPurchase: String(v.minPurchase),
      description: v.description ?? '',
      validFrom: v.validFrom ?? '',
      validTo: v.validTo ?? '',
      usageLimit: v.usageLimit != null ? String(v.usageLimit) : '',
      isActive: v.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    const code = formData.code.trim().toUpperCase()
    if (!code) return
    const minPurchase = parseInt(formData.minPurchase, 10) || 0
    const discount = formData.type === 'free_shipping' ? 0 : (parseInt(formData.discount, 10) || 0)
    const usageLimit = formData.usageLimit ? parseInt(formData.usageLimit, 10) : undefined
    const validFrom = formData.validFrom || undefined
    const validTo = formData.validTo || undefined

    if (isApiConfigured() && getAdminToken()) {
      setSaving(true)
      try {
        if (editingVoucher) {
          const updated = await voucherUpdate(getAdminToken(), editingVoucher.id, {
            type: formData.type,
            discount,
            minPurchase,
            description: formData.description || undefined,
            validFrom,
            validTo,
            usageLimit,
            isActive: formData.isActive,
          })
          setVouchers((prev) =>
            prev.map((v) => (v.id === editingVoucher.id ? apiToVoucher(updated) : v))
          )
        } else {
          const created = await voucherCreate(getAdminToken(), {
            code,
            type: formData.type,
            discount,
            minPurchase,
            description: formData.description || undefined,
            validFrom,
            validTo,
            usageLimit,
            isActive: formData.isActive,
          })
          setVouchers((prev) => [...prev, apiToVoucher(created)])
        }
        setIsDialogOpen(false)
        setEditingVoucher(null)
        setFormData({
          code: '',
          type: 'percentage',
          discount: '',
          minPurchase: '',
          description: '',
          validFrom: '',
          validTo: '',
          usageLimit: '',
          isActive: true,
        })
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Gagal menyimpan voucher.')
      } finally {
        setSaving(false)
      }
      return
    }

    if (editingVoucher) {
      setVouchers((prev) =>
        prev.map((v) =>
          v.id === editingVoucher.id
            ? {
                ...v,
                code,
                type: formData.type,
                discount,
                minPurchase,
                description: formData.description || undefined,
                validFrom,
                validTo,
                usageLimit,
                isActive: formData.isActive,
              }
            : v
        )
      )
    } else {
      const newVoucher: Voucher = {
        id: Date.now().toString(),
        code,
        type: formData.type,
        discount,
        minPurchase,
        description: formData.description || undefined,
        validFrom,
        validTo,
        usageLimit,
        usedCount: 0,
        isActive: formData.isActive,
      }
      setVouchers((prev) => [...prev, newVoucher])
    }
    setIsDialogOpen(false)
    setEditingVoucher(null)
    setFormData({
      code: '',
      type: 'percentage',
      discount: '',
      minPurchase: '',
      description: '',
      validFrom: '',
      validTo: '',
      usageLimit: '',
      isActive: true,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus voucher ini? Pelanggan tidak akan bisa memakai kode ini lagi.')) return
    if (isApiConfigured() && getAdminToken()) {
      try {
        await voucherDelete(getAdminToken(), id)
        setVouchers((prev) => prev.filter((v) => v.id !== id))
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Gagal menghapus voucher.')
      }
      return
    }
    setVouchers((prev) => prev.filter((v) => v.id !== id))
  }

  const handleToggleActive = async (v: Voucher) => {
    if (isApiConfigured() && getAdminToken()) {
      try {
        const updated = await voucherUpdate(getAdminToken(), v.id, { isActive: !v.isActive })
        setVouchers((prev) =>
          prev.map((x) => (x.id === v.id ? apiToVoucher(updated) : x))
        )
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Gagal mengubah status voucher.')
      }
      return
    }
    setVouchers((prev) =>
      prev.map((x) => (x.id === v.id ? { ...x, isActive: !x.isActive } : x))
    )
  }

  const filtered = vouchers.filter((v) => {
    const matchSearch =
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.description ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = filterType === 'all' || v.type === filterType
    return matchSearch && matchType
  })

  const formatPrice = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
  const typeLabel = (t: VoucherType) => {
    if (t === 'percentage') return 'Diskon %'
    if (t === 'fixed') return 'Diskon nominal'
    return 'Gratis ongkir'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kelola Voucher</h1>
          <p className="text-muted-foreground">Buat dan kelola kode voucher untuk pelanggan</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVoucher ? 'Edit Voucher' : 'Tambah Voucher Baru'}</DialogTitle>
              <DialogDescription>Kode voucher akan dipakai pelanggan di halaman keranjang.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Kode Voucher *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="CONTOH10"
                  disabled={!!editingVoucher}
                />
                {editingVoucher && (
                  <p className="text-xs text-muted-foreground">Kode tidak dapat diubah setelah dibuat.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Tipe *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as VoucherType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Diskon persen</SelectItem>
                    <SelectItem value="fixed">Diskon nominal (Rp)</SelectItem>
                    <SelectItem value="free_shipping">Gratis ongkos kirim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type !== 'free_shipping' && (
                <div className="space-y-2">
                  <Label>
                    {formData.type === 'percentage' ? 'Persentase diskon (%)' : 'Nominal diskon (Rp)'} *
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder={formData.type === 'percentage' ? '10' : '50000'}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Minimal pembelian (Rp) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi (opsional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: Diskon 10% untuk pembelian pertama"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Berlaku dari (opsional)</Label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Berlaku sampai (opsional)</Label>
                  <Input
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Batas pemakaian (opsional)</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Tanpa batas"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Aktif</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(c) => setFormData({ ...formData, isActive: c })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={
                    saving ||
                    !formData.code.trim() ||
                    (formData.type !== 'free_shipping' && (formData.discount === '' || Number(formData.discount) < 0))
                  }
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : editingVoucher ? (
                    'Simpan'
                  ) : (
                    'Tambah'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingVoucher(null)
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode atau deskripsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua tipe</SelectItem>
            <SelectItem value="percentage">Diskon %</SelectItem>
            <SelectItem value="fixed">Diskon nominal</SelectItem>
            <SelectItem value="free_shipping">Gratis ongkir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Ticket className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada voucher</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== 'all'
                  ? 'Tidak ada voucher yang sesuai filter.'
                  : 'Belum ada voucher. Tambah voucher agar pelanggan bisa pakai di keranjang.'}
              </p>
              {!searchTerm && filterType === 'all' && (
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Voucher
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Diskon</TableHead>
                  <TableHead>Min. Belanja</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Berlaku</TableHead>
                  <TableHead className="text-center">Pemakaian</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[150px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono font-medium">{v.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {typeLabel(v.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {v.type === 'percentage' && (
                        <span className="font-medium text-primary">{v.discount}%</span>
                      )}
                      {v.type === 'fixed' && (
                        <span className="font-medium text-primary">{formatPrice(v.discount)}</span>
                      )}
                      {v.type === 'free_shipping' && (
                        <span className="text-sm text-muted-foreground">Gratis ongkir</span>
                      )}
                    </TableCell>
                    <TableCell>{formatPrice(v.minPurchase)}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {v.description || '–'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {v.validFrom && v.validTo ? (
                        <div>
                          <div>{new Date(v.validFrom).toLocaleDateString('id-ID')}</div>
                          <div className="text-muted-foreground text-xs">
                            s/d {new Date(v.validTo).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Selamanya</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {v.usageLimit != null && v.usageLimit > 0 ? (
                        <span>
                          {v.usedCount} / {v.usageLimit}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={v.isActive}
                        onCheckedChange={() => handleToggleActive(v)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(v)}
                          className="h-8 px-2"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(v.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
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
