'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Leaf,
  Shield,
  Truck,
  Star,
  Heart,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/app/context/auth-context'
import { useCart } from '@/app/context/cart-context'

const FEATURED_PRODUCTS = [
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
]

const FEATURES = [
  {
    icon: Shield,
    title: 'Produk Asli',
    description: 'Langsung dari Desa Lamahang, Kabupaten Buru, Maluku',
  },
  {
    icon: Star,
    title: 'Berkualitas Premium',
    description: 'Telah dipercaya oleh ribuan pelanggan Indonesia',
  },
  {
    icon: Truck,
    title: 'Pengiriman Cepat',
    description: 'Gratis ongkir untuk pembelian di atas Rp 100.000',
  },
  {
    icon: Heart,
    title: 'Produk Alami',
    description: 'Tanpa bahan kimia berbahaya, 100% aman untuk keluarga',
  },
]

const TESTIMONIALS = [
  {
    name: 'Budi Santoso',
    city: 'Jakarta',
    rating: 5,
    text: 'Produk luar biasa! Aroma alami dan manfaatnya terasa sekali. Saya sudah jadi pelanggan setia.',
  },
  {
    name: 'Siti Nurhaliza',
    city: 'Bandung',
    rating: 5,
    text: 'Pengiriman cepat, packaging rapih, produk sesuai deskripsi. Akan membeli lagi!',
  },
  {
    name: 'Ahmad Wijaya',
    city: 'Surabaya',
    rating: 4,
    text: 'Harga terjangkau untuk kualitas premium. Rekomendasi untuk semua orang!',
  },
]

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`
  }

  const handleBuyNow = (product: typeof FEATURED_PRODUCTS[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      quantity: 1,
    })
    router.push('/cart')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-24 bg-gradient-to-b from-primary/5 to-secondary/20">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center mb-4">
            <Leaf className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-balance">
            Minyak Kayu Putih Premium dari Lamahang
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Minyak kayu putih alami 100% dari Desa Lamahang, Kecamatan Waplau, Kabupaten Buru,
            Provinsi Maluku. Kualitas terbaik untuk kesehatan keluarga Indonesia.
          </p>
          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <Button size="lg" onClick={() => router.push('/shop')}>
              <ShoppingBag className="w-5 h-5 mr-2" />
              Mulai Belanja
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/about')}>
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">50K+</p>
              <p className="text-sm text-muted-foreground">Pelanggan Puas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">4.8★</p>
              <p className="text-sm text-muted-foreground">Rating Produk</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground">Alami & Aman</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground">Dukungan Pelanggan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Mengapa Memilih Lamahang?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition">
                  <CardContent className="pt-6">
                    <div className="text-primary mb-4">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Produk Unggulan</h2>
              <p className="text-muted-foreground">Pilihan terbaik dari koleksi kami</p>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="hidden md:flex">
                Lihat Semua
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_PRODUCTS.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition border-0">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center relative">
                  <Leaf className="w-20 h-20 text-primary opacity-30" />
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                      {product.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2 mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({product.reviews} ulasan)</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
                    <Button size="sm" onClick={() => handleBuyNow(product)}>
                      Beli Sekarang
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link href="/shop">
              <Button variant="outline">
                Lihat Semua Produk
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Testimoni Pelanggan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, idx) => (
              <Card key={idx} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.city}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Siap Memulai Perjalanan Kesehatan Anda?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dapatkan minyak kayu putih premium langsung dari sumbernya. 
            Mulai belanja sekarang dan rasakan manfaatnya untuk keluarga Anda.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {isAuthenticated ? (
              <>
                <Button size="lg" onClick={() => router.push('/shop')}>
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Belanja Sekarang
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push('/dashboard')}>
                  Lihat Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={() => router.push('/shop')}>
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Mulai Belanja
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push('/register')}>
                  Daftar Sekarang
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Manfaat Minyak Kayu Putih</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              'Meredakan nyeri otot dan sendi',
              'Mengatasi masuk angin dan perut kembung',
              'Meredakan sakit kepala',
              'Mengobati luka dan iritasi kulit',
              'Menghangatkan tubuh',
              'Mengurangi stres dan kelelahan',
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
