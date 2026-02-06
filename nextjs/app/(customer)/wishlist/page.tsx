'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart, Trash2, Leaf, Cloud, CloudOff } from 'lucide-react'
import { useWishlist } from '@/app/context/wishlist-context'
import { useCart } from '@/app/context/cart-context'

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, getUnsyncedItems, isLoading } = useWishlist()
  const { addToCart } = useCart()
  const unsyncedCount = getUnsyncedItems().length

  const handleRemove = (id: number) => {
    removeFromWishlist(id)
  }

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      quantity: 1,
    })
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Memuat wishlist...</p>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            Wishlist Saya
          </h1>
          {unsyncedCount > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <CloudOff className="w-3 h-3 mr-1" />
              {unsyncedCount} item belum tersimpan
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">Produk favorit yang ingin Anda beli</p>
      </div>

      {wishlistItems.length > 0 ? (
        <>
          {/* Summary */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-secondary/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{wishlistItems.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Nilai</p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(totalValue)}</p>
                </div>
                <div className="flex items-end">
                  <Button className="w-full" size="sm">
                    Beli Semua
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wishlist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition border-0">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center relative">
                  <Leaf className="w-16 h-16 text-primary opacity-30" />
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50 transition"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>
                  {/* Sync Status Badge */}
                  {item.syncedToBackend ? (
                    <Badge 
                      variant="outline" 
                      className="absolute top-2 left-2 bg-green-50 text-green-700 border-green-200 text-xs"
                    >
                      <Cloud className="w-3 h-3 mr-1" />
                      Tersimpan
                    </Badge>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className="absolute top-2 left-2 bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                    >
                      <CloudOff className="w-3 h-3 mr-1" />
                      Belum Tersimpan
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-2">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>

                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium">⭐ {item.rating}</span>
                    <span className="text-muted-foreground">({item.reviews})</span>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-lg font-bold text-primary mb-3">{formatPrice(item.price)}</p>
                    {item.syncedAt && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Tersimpan: {new Date(item.syncedAt).toLocaleDateString('id-ID')}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Beli
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(item.id)}
                        className="px-3"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Wishlist Kosong</h3>
          <p className="text-muted-foreground mb-6">Belum ada produk dalam wishlist Anda</p>
          <Button>Jelajahi Produk</Button>
        </div>
      )}
    </div>
  )
}
