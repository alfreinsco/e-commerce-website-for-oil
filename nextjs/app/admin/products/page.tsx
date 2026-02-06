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
import { Package, Plus, Edit2, Trash2, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Product {
  id: number
  name: string
  price: number
  description: string
  category: string
  stock: number
  rating?: number
  reviews?: number
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
  })

  // Load products from localStorage
  useEffect(() => {
    const storedProducts = localStorage.getItem('admin_products')
    if (storedProducts) {
      try {
        const parsed = JSON.parse(storedProducts)
        setProducts(parsed)
      } catch (error) {
        console.error('Failed to parse stored products:', error)
      }
    } else {
      // Initialize with default products
      const defaultProducts: Product[] = [
        {
          id: 1,
          name: 'Minyak Kayu Putih 100ml',
          price: 45000,
          description: 'Minyak kayu putih murni dari Lamahang',
          category: 'Original',
          stock: 50,
          rating: 4.8,
          reviews: 245,
        },
        {
          id: 2,
          name: 'Minyak Kayu Putih 250ml',
          price: 95000,
          description: 'Ukuran jumbo untuk penggunaan keluarga',
          category: 'Original',
          stock: 30,
          rating: 4.9,
          reviews: 189,
        },
        {
          id: 3,
          name: 'Paket Hemat 3 Botol 100ml',
          price: 120000,
          description: 'Hemat lebih banyak dengan paket 3 botol',
          category: 'Bundle',
          stock: 25,
          rating: 4.7,
          reviews: 156,
        },
        {
          id: 4,
          name: 'Minyak Kayu Putih Premium 250ml',
          price: 125000,
          description: 'Versi premium dengan kemasan eksklusif',
          category: 'Premium',
          stock: 20,
          rating: 4.9,
          reviews: 98,
        },
        {
          id: 5,
          name: 'Paket Perawatan Keluarga',
          price: 250000,
          description: 'Lengkap untuk perawatan kesehatan keluarga',
          category: 'Bundle',
          stock: 15,
          rating: 4.8,
          reviews: 67,
        },
        {
          id: 6,
          name: 'Minyak Kayu Putih Organik 100ml',
          price: 85000,
          description: 'Organik tanpa bahan kimia tambahan',
          category: 'Organik',
          stock: 40,
          rating: 4.9,
          reviews: 142,
        },
      ]
      setProducts(defaultProducts)
      localStorage.setItem('admin_products', JSON.stringify(defaultProducts))
    }
  }, [])

  // Save products to localStorage
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('admin_products', JSON.stringify(products))
    }
  }, [products])

  const handleAddProduct = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      stock: '',
    })
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
    })
    setIsDialogOpen(true)
  }

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.description || !formData.category || !formData.stock) {
      return
    }

    if (editingProduct) {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formData.name,
                price: parseInt(formData.price),
                description: formData.description,
                category: formData.category,
                stock: parseInt(formData.stock),
              }
            : p
        )
      )
    } else {
      // Add new product
      const newProduct: Product = {
        id: Date.now(),
        name: formData.name,
        price: parseInt(formData.price),
        description: formData.description,
        category: formData.category,
        stock: parseInt(formData.stock),
        rating: 0,
        reviews: 0,
      }
      setProducts((prev) => [...prev, newProduct])
    }

    setIsDialogOpen(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      stock: '',
    })
  }

  const handleDeleteProduct = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  const categories = ['Original', 'Premium', 'Organik', 'Bundle', 'Travel']

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <DialogTitle>
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
              <DialogDescription>
                Lengkapi informasi produk
              </DialogDescription>
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
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
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

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveProduct} className="flex-1" disabled={!formData.name || !formData.price || !formData.description || !formData.category || !formData.stock}>
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingProduct(null)
                    setFormData({
                      name: '',
                      price: '',
                      description: '',
                      category: '',
                      stock: '',
                    })
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="mt-1">{product.description}</CardDescription>
                </div>
                <Badge variant="outline">{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Harga</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stok</span>
                  <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {product.stock} unit
                  </span>
                </div>
                {product.rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <span className="text-sm font-medium">{product.rating} ⭐ ({product.reviews} ulasan)</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
