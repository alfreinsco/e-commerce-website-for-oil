'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Leaf, Shield, Star, Truck, Heart, Award, Users, MapPin } from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: Shield,
      title: 'Produk Asli',
      description: 'Langsung dari Desa Lamahang, Kabupaten Buru, Maluku. Kami menjamin keaslian produk dengan sertifikasi resmi.',
    },
    {
      icon: Star,
      title: 'Berkualitas Premium',
      description: 'Telah dipercaya oleh ribuan pelanggan di seluruh Indonesia. Kualitas teruji dengan rating 4.8/5.',
    },
    {
      icon: Truck,
      title: 'Pengiriman Cepat',
      description: 'Gratis ongkir untuk pembelian di atas Rp 100.000. Pengiriman ke seluruh Indonesia dengan jaminan aman sampai.',
    },
    {
      icon: Heart,
      title: '100% Alami',
      description: 'Tanpa bahan kimia berbahaya, aman untuk keluarga. Diproses dengan metode tradisional yang telah teruji.',
    },
  ]

  const values = [
    {
      icon: Award,
      title: 'Komitmen Kualitas',
      description: 'Setiap produk melalui proses seleksi ketat untuk memastikan kualitas terbaik.',
    },
    {
      icon: Users,
      title: 'Pelayanan Pelanggan',
      description: 'Tim kami siap membantu Anda 24/7 dengan pelayanan yang ramah dan responsif.',
    },
    {
      icon: MapPin,
      title: 'Dari Sumber Langsung',
      description: 'Bekerja langsung dengan petani lokal untuk memastikan produk segar dan berkualitas.',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
          <Leaf className="w-20 h-20 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">
          Tentang Lamahang
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Kami adalah platform e-commerce yang menghadirkan minyak kayu putih premium 
          langsung dari Desa Lamahang, Kecamatan Waplau, Kabupaten Buru, Provinsi Maluku. 
          Dengan komitmen untuk menyediakan produk alami berkualitas tinggi, kami menghubungkan 
          produk lokal terbaik dengan pelanggan di seluruh Indonesia.
        </p>
      </section>

      {/* Story Section */}
      <section className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 md:p-12 space-y-6">
            <h2 className="text-3xl font-bold text-center mb-8">Cerita Kami</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Desa Lamahang telah dikenal sejak lama sebagai penghasil minyak kayu putih 
                berkualitas tinggi. Produk ini dihasilkan dari pohon kayu putih yang tumbuh 
                subur di tanah vulkanik Maluku, memberikan khasiat yang luar biasa.
              </p>
              <p>
                Berawal dari keinginan untuk memperkenalkan produk lokal berkualitas ke pasar 
                yang lebih luas, kami membangun platform ini dengan visi untuk memberdayakan 
                petani lokal sekaligus memberikan akses mudah bagi konsumen untuk mendapatkan 
                produk alami terbaik.
              </p>
              <p>
                Setiap tetes minyak kayu putih yang kami jual adalah hasil kerja keras petani 
                lokal yang telah mengolah dengan metode tradisional yang diwariskan turun-temurun. 
                Kami percaya bahwa produk alami adalah investasi terbaik untuk kesehatan keluarga Anda.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">Mengapa Memilih Kami?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/30 py-12 rounded-lg">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Nilai-Nilai Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Pelanggan</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.8</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Alami</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-4xl mx-auto">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 md:p-12 space-y-6 text-center">
            <h2 className="text-3xl font-bold">Misi Kami</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Menjadi platform terpercaya yang menghubungkan produk minyak kayu putih premium 
              dari Desa Lamahang dengan keluarga Indonesia, sambil mendukung ekonomi lokal dan 
              melestarikan warisan budaya pengolahan minyak kayu putih tradisional.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
