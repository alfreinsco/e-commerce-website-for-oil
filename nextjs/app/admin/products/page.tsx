'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Package, Plus, Edit2, Trash2, Search, Loader2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getAdminToken, isApiConfigured, productsGet, productCreate, productUpdate, productDelete } from '@/lib/api'

interface ProductImage {
  id: string
  url: string
}

interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  stock: number
  supportsCod?: boolean
  isActive?: boolean
  rating?: number
  reviews?: number
  images?: ProductImage[]
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Minyak Kayu Putih 100ml', price: 45000, description: 'Minyak kayu putih murni dari Lamahang', category: 'Original', stock: 50, supportsCod: true, isActive: true, rating: 4.8, reviews: 245, images: [] },
  { id: '2', name: 'Minyak Kayu Putih 250ml', price: 95000, description: 'Ukuran jumbo untuk penggunaan keluarga', category: 'Original', stock: 30, supportsCod: true, isActive: true, rating: 4.9, reviews: 189, images: [] },
  { id: '3', name: 'Paket Hemat 3 Botol 100ml', price: 120000, description: 'Hemat lebih banyak dengan paket 3 botol', category: 'Bundle', stock: 25, supportsCod: true, isActive: true, rating: 4.7, reviews: 156, images: [] },
  { id: '4', name: 'Minyak Kayu Putih Premium 250ml', price: 125000, description: 'Versi premium dengan kemasan eksklusif', category: 'Premium', stock: 20, supportsCod: true, isActive: true, rating: 4.9, reviews: 98, images: [] },
  { id: '5', name: 'Paket Perawatan Keluarga', price: 250000, description: 'Lengkap untuk perawatan kesehatan keluarga', category: 'Bundle', stock: 15, supportsCod: true, isActive: true, rating: 4.8, reviews: 67, images: [] },
  { id: '6', name: 'Minyak Kayu Putih Organik 100ml', price: 85000, description: 'Organik tanpa bahan kimia tambahan', category: 'Organik', stock: 40, supportsCod: true, isActive: true, rating: 4.9, reviews: 142, images: [] },
]

const STORAGE_KEY = 'admin_products'
const categories = ['Original', 'Premium', 'Organik', 'Bundle', 'Travel']

function apiToProduct(a: { id: string; name: string; price: number; description: string; category: string; stock: number; supportsCod?: boolean; isActive?: boolean; rating?: number | null; reviews?: number | null; images?: { id: string; url: string }[] }): Product {
  return {
    id: String(a.id),
    name: a.name,
    price: a.price,
    description: a.description,
    category: a.category,
    stock: a.stock,
    supportsCod: a.supportsCod !== false,
    isActive: a.isActive !== false,
    rating: a.rating ?? undefined,
    reviews: a.reviews ?? undefined,
    images: a.images ?? [],
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    supportsCod: true,
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([])

  useEffect(() => {
    if (isApiConfigured() && getAdminToken()) {
      setLoading(true)
      productsGet(getAdminToken())
        .then((list) => setProducts(list.map(apiToProduct)))
        .catch(() => {
          try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
              const parsed = JSON.parse(stored)
              setProducts(parsed.map((p: { id: number | string; name: string; price: number; description: string; category: string; stock: number; rating?: number; reviews?: number }) => ({
                ...p,
                id: String(p.id),
              })))
            } else setProducts(DEFAULT_PRODUCTS)
          } catch {
            setProducts(DEFAULT_PRODUCTS)
          }
        })
        .finally(() => setLoading(false))
      return
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setProducts(parsed.map((p: { id: number | string }) => ({ ...p, id: String(p.id) })))
      } catch {
        setProducts(DEFAULT_PRODUCTS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS))
      }
    } else {
      setProducts(DEFAULT_PRODUCTS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (products.length > 0 && (!isApiConfigured() || !getAdminToken())) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    }
  }, [products])

  const handleAddProduct = () => {
    setEditingProduct(null)
    setFormData({ name: '', price: '', description: '', category: '', stock: '', supportsCod: true })
    setImageFiles([])
    setExistingImages([])
    setDeleteImageIds([])
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      stock: product.stock.toString(),
      supportsCod: product.supportsCod !== false,
    })
    setImageFiles([])
    setExistingImages(product.images ?? [])
    setDeleteImageIds([])
    setIsDialogOpen(true)
  }

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.description || !formData.category || !formData.stock) return
    const price = parseInt(formData.price, 10) || 0
    const stock = parseInt(formData.stock, 10) || 0

    if (isApiConfigured() && getAdminToken()) {
      setSaving(true)
      try {
        if (editingProduct) {
          const updated = await productUpdate(
            getAdminToken(),
            editingProduct.id,
            {
              name: formData.name,
              price,
              description: formData.description,
              category: formData.category,
              stock,
              supportsCod: formData.supportsCod,
            },
            {
              files: imageFiles.length ? imageFiles : undefined,
              deleteImageIds: deleteImageIds.length ? deleteImageIds : undefined,
            }
          )
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? apiToProduct(updated) : p)))
        } else {
          const created = await productCreate(
            getAdminToken(),
            {
              name: formData.name,
              price,
              description: formData.description,
              category: formData.category,
              stock,
              supportsCod: formData.supportsCod,
            },
            imageFiles.length ? imageFiles : undefined
          )
          setProducts((prev) => [...prev, apiToProduct(created)])
        }
        setIsDialogOpen(false)
        setEditingProduct(null)
        setFormData({ name: '', price: '', description: '', category: '', stock: '', supportsCod: true })
        setImageFiles([])
        setExistingImages([])
        setDeleteImageIds([])
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Gagal menyimpan produk.')
      } finally {
        setSaving(false)
      }
      return
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, name: formData.name, price, description: formData.description, category: formData.category, stock, supportsCod: formData.supportsCod }
            : p
        )
      )
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        price,
        description: formData.description,
        category: formData.category,
        stock,
        supportsCod: formData.supportsCod,
        rating: 0,
        reviews: 0,
        images: [],
      }
      setProducts((prev) => [...prev, newProduct])
    }
    setIsDialogOpen(false)
    setEditingProduct(null)
    setFormData({ name: '', price: '', description: '', category: '', stock: '', supportsCod: true })
    setImageFiles([])
    setExistingImages([])
    setDeleteImageIds([])
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return
    if (isApiConfigured() && getAdminToken()) {
      try {
        await productDelete(getAdminToken(), id)
        setProducts((prev) => prev.filter((p) => p.id !== id))
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Gagal menghapus produk.')
      }
      return
    }
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleToggleActive = async (product: Product) => {
    const next = !(product.isActive !== false)
    if (isApiConfigured() && getAdminToken()) {
      try {
        const updated = await productUpdate(getAdminToken(), product.id, { isActive: next })
        setProducts((prev) => prev.map((p) => (p.id === product.id ? apiToProduct(updated) : p)))
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Gagal mengubah status produk.')
      }
      return
    }
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isActive: next } : p)))
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`

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
          <h1 className="text-3xl font-bold">Kelola Produk</h1>
          <p className="text-muted-foreground">Kelola produk yang dijual di toko</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
              <DialogDescription>Lengkapi informasi produk</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama produk"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Harga (Rp) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="45000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stok *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masukkan deskripsi produk"
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">Bisa COD</Label>
                  <p className="text-sm text-muted-foreground">Produk ini dapat dibayar saat terima (Cash on Delivery)</p>
                </div>
                <Switch
                  checked={formData.supportsCod}
                  onCheckedChange={(c) => setFormData({ ...formData, supportsCod: c })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gambar produk (bisa lebih dari 1)</Label>
                <p className="text-sm text-muted-foreground">Format JPG/PNG, max 5MB per file. Saat edit, gambar baru ditambahkan ke yang sudah ada.</p>
                {existingImages.filter((img) => !deleteImageIds.includes(img.id)).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {existingImages
                      .filter((img) => !deleteImageIds.includes(img.id))
                      .map((img) => (
                        <div key={img.id} className="relative group">
                          <img src={img.url} alt="" className="h-20 w-20 object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => setDeleteImageIds((prev) => [...prev, img.id])}
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-90 group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
                {imageFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imageFiles.map((file, i) => (
                      <div key={i} className="relative group">
                        <img src={URL.createObjectURL(file)} alt="" className="h-20 w-20 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-90 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="cursor-pointer"
                  onChange={(e) => {
                    const files = e.target.files
                    if (files?.length) setImageFiles((prev) => [...prev, ...Array.from(files)])
                    e.target.value = ''
                  }}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveProduct}
                  className="flex-1"
                  disabled={saving || !formData.name || !formData.price || !formData.description || !formData.category || !formData.stock}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : editingProduct ? (
                    'Simpan Perubahan'
                  ) : (
                    'Tambah Produk'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingProduct(null)
                    setFormData({ name: '', price: '', description: '', category: '', stock: '', supportsCod: true })
                    setImageFiles([])
                    setExistingImages([])
                    setDeleteImageIds([])
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

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada produk</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Tidak ada produk yang sesuai dengan pencarian' : 'Belum ada produk yang ditambahkan'}
              </p>
              {!searchTerm && (
                <Button onClick={handleAddProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Produk Pertama
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Gambar</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="w-[80px]">COD</TableHead>
                  <TableHead className="w-[90px]">Aktif</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead className="w-[120px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images?.length ? (
                        <img
                          src={product.images[0].url}
                          alt=""
                          className="h-12 w-12 object-cover rounded border"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">
                          {product.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={
                          product.stock > 10
                            ? 'text-green-600 font-medium'
                            : product.stock > 0
                              ? 'text-yellow-600 font-medium'
                              : 'text-red-600 font-medium'
                        }
                      >
                        {product.stock} unit
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.supportsCod !== false ? 'default' : 'secondary'}>
                        {product.supportsCod !== false ? 'Ya' : 'Tidak'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={product.isActive !== false}
                        onCheckedChange={() => handleToggleActive(product)}
                      />
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {product.rating != null ? `${product.rating} ⭐ (${product.reviews ?? 0})` : '–'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)} className="h-8 px-2">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
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
