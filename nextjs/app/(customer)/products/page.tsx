'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Leaf, Search, Star, Heart, ShoppingCart } from 'lucide-react'

const PRODUCTS = [
  {
    id: 1,
    name: 'Minyak Kayu Putih 100ml',
    price: 45000,
    description: 'Minyak kayu putih murni dari Lamahang',
    rating: 4.8,
    reviews: 245,
    category: 'Original',
  },
  {
    id: 2,
    name: 'Minyak Kayu Putih 250ml',
    price: 95000,
    description: 'Ukuran jumbo untuk penggunaan keluarga',
    rating: 4.9,
    reviews: 189,
    category: 'Original',
  },
  {
    id: 3,
    name: 'Paket Hemat 3 Botol 100ml',
    price: 120000,
    description: 'Hemat lebih banyak dengan paket 3 botol',
    rating: 4.7,
    reviews: 156,
    category: 'Bundle',
  },
  {
    id: 4,
    name: 'Minyak Kayu Putih Premium 250ml',
    price: 125000,
    description: 'Versi premium dengan kemasan eksklusif',
    rating: 4.9,
    reviews: 98,
    category: 'Premium',
  },
  {
    id: 5,
    name: 'Paket Perawatan Keluarga',
    price: 250000,
    description: 'Lengkap untuk perawatan kesehatan keluarga',
    rating: 4.8,
    reviews: 67,
    category: 'Bundle',
  },
  {
    id: 6,
    name: 'Minyak Kayu Putih Organik 100ml',
    price: 85000,
    description: 'Organik tanpa bahan kimia tambahan',
    rating: 4.9,
    reviews: 142,
    category: 'Organik',
  },
  {
    id: 7,
    name: 'Travel Size 30ml',
    price: 25000,
    description: 'Praktis untuk dibawa kemana-mana',
    rating: 4.6,
    reviews: 203,
    category: 'Travel',
  },
  {
    id: 8,
    name: 'Bundle Hemat Tahunan',
    price: 450000,
    description: 'Paket ekonomis untuk setahun penuh',
    rating: 4.8,
    reviews: 45,
    category: 'Bundle',
  },
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = ['Original', 'Premium', 'Organik', 'Bundle', 'Travel']

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Leaf className="w-8 h-8 text-primary" />
          Produk Minyak Kayu Putih
        </h1>
        <p className="text-muted-foreground">Pilihan lengkap dari Desa Lamahang</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
          size="sm"
        >
          Semua
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition border-0">
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center relative overflow-hidden">
              <Leaf className="w-16 h-16 text-primary opacity-30" />
              <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-semibold">
                {product.category}
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">({product.reviews} ulasan)</span>
              </div>

              <div className="border-t pt-3">
                <p className="text-lg font-bold text-primary mb-3">{formatPrice(product.price)}</p>
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Beli
                  </Button>
                  <Button variant="outline" size="sm" className="px-3 bg-transparent">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Leaf className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Produk tidak ditemukan</p>
        </div>
      )}
    </div>
  )
}
