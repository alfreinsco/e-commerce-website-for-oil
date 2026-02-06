'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Leaf, Search, Star, Heart, ShoppingCart, Plus, Minus, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/app/context/cart-context'
import { useWishlist } from '@/app/context/wishlist-context'
import { Cloud, CloudOff } from 'lucide-react'

const PRODUCTS = [
  {
    id: 1,
    name: 'Minyak Kayu Putih 100ml',
    price: 45000,
    description: 'Minyak kayu putih murni dari Lamahang',
    rating: 4.8,
    reviews: 245,
    category: 'Original',
    stock: 50,
  },
  {
    id: 2,
    name: 'Minyak Kayu Putih 250ml',
    price: 95000,
    description: 'Ukuran jumbo untuk penggunaan keluarga',
    rating: 4.9,
    reviews: 189,
    category: 'Original',
    stock: 30,
  },
  {
    id: 3,
    name: 'Paket Hemat 3 Botol 100ml',
    price: 120000,
    description: 'Hemat lebih banyak dengan paket 3 botol',
    rating: 4.7,
    reviews: 156,
    category: 'Bundle',
    stock: 25,
  },
  {
    id: 4,
    name: 'Minyak Kayu Putih Premium 250ml',
    price: 125000,
    description: 'Versi premium dengan kemasan eksklusif',
    rating: 4.9,
    reviews: 98,
    category: 'Premium',
    stock: 20,
  },
  {
    id: 5,
    name: 'Paket Perawatan Keluarga',
    price: 250000,
    description: 'Lengkap untuk perawatan kesehatan keluarga',
    rating: 4.8,
    reviews: 67,
    category: 'Bundle',
    stock: 15,
  },
  {
    id: 6,
    name: 'Minyak Kayu Putih Organik 100ml',
    price: 85000,
    description: 'Organik tanpa bahan kimia tambahan',
    rating: 4.9,
    reviews: 142,
    category: 'Organik',
    stock: 40,
  },
]

export default function ShopPage() {
  const { addToCart: addItemToCart, cartItems } = useCart()
  const { toggleWishlist, isInWishlist, wishlistItems } = useWishlist()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set())

  const categories = ['Original', 'Premium', 'Organik', 'Bundle']

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  const getQuantity = (productId: number) => quantities[productId] || 1

  const incrementQuantity = (productId: number, stock: number) => {
    const current = getQuantity(productId)
    if (current < stock) {
      setQuantities({ ...quantities, [productId]: current + 1 })
    }
  }

  const decrementQuantity = (productId: number) => {
    const current = getQuantity(productId)
    if (current > 1) {
      setQuantities({ ...quantities, [productId]: current - 1 })
    }
  }

  const addToCart = (product: typeof PRODUCTS[0]) => {
    const quantity = getQuantity(product.id)
    
    addItemToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      quantity: quantity,
    })

    // Show feedback
    setAddedItems((prev) => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }, 2000)
  }

  const isItemInCart = (productId: number) => {
    return cartItems.some((item) => item.id === productId)
  }

  const handleToggleWishlist = (product: typeof PRODUCTS[0]) => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
    })
  }

  const getWishlistItem = (productId: number) => {
    return wishlistItems.find((item) => item.id === productId)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <Leaf className="w-10 h-10 text-primary" />
          Produk Minyak Kayu Putih
        </h1>
        <p className="text-muted-foreground text-lg">
          Produk berkualitas dari Desa Lamahang
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center gap-2 flex-wrap">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center relative overflow-hidden">
              <Leaf className="w-20 h-20 text-primary opacity-30" />
              <Badge className="absolute top-3 right-3">
                {product.category}
              </Badge>
              {/* Sync Status Badge */}
              {isItemInCart(product.id) && (
                <div className="absolute top-3 left-3">
                  {cartItems.find((item) => item.id === product.id)?.syncedToBackend ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Cloud className="w-3 h-3 mr-1" />
                      Tersimpan
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <CloudOff className="w-3 h-3 mr-1" />
                      Belum Tersimpan
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviews})
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Stok: {product.stock}
                </span>
              </div>

              <div className="border-t pt-4 space-y-3">
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </p>

                {/* Quantity Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Jumlah:</span>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => decrementQuantity(product.id)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">
                      {getQuantity(product.id)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => incrementQuantity(product.id, product.stock)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 relative">
                  <Button
                    className="flex-1"
                    onClick={() => addToCart(product)}
                    disabled={addedItems.has(product.id)}
                    variant={isItemInCart(product.id) ? 'outline' : 'default'}
                  >
                    {addedItems.has(product.id) ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Ditambahkan
                      </>
                    ) : isItemInCart(product.id) ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Sudah di Keranjang
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Tambah ke Keranjang
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleToggleWishlist(product)}
                    className={`relative ${isInWishlist(product.id) ? 'text-red-500 hover:text-red-600' : ''}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500' : ''}`} 
                    />
                    {/* Wishlist Sync Status Indicator */}
                    {isInWishlist(product.id) && (
                      <div className="absolute -top-1 -right-1">
                        {getWishlistItem(product.id)?.syncedToBackend ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full border-2 border-white" title="Favorit tersimpan" />
                        ) : (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full border-2 border-white" title="Favorit belum tersimpan" />
                        )}
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Leaf className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Produk tidak ditemukan</p>
        </div>
      )}
    </div>
  )
}
