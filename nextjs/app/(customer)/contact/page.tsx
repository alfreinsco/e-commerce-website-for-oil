'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Leaf, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare,
  Send,
  CheckCircle2
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulasi pengiriman form
    console.log('Form submitted:', formData)
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'info@lamahang.com',
      link: 'mailto:info@lamahang.com',
    },
    {
      icon: Phone,
      title: 'Telepon',
      content: '+62 812-3456-7890',
      link: 'tel:+6281234567890',
    },
    {
      icon: MapPin,
      title: 'Alamat',
      content: 'Desa Lamahang, Kec. Waplau, Kab. Buru, Maluku',
      link: null,
    },
    {
      icon: Clock,
      title: 'Jam Operasional',
      content: 'Senin - Minggu: 08:00 - 20:00 WIB',
      link: null,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex justify-center mb-4">
          <Leaf className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">Hubungi Kami</h1>
        <p className="text-lg text-muted-foreground">
          Ada pertanyaan atau butuh bantuan? Tim kami siap membantu Anda. 
          Jangan ragu untuk menghubungi kami melalui form di bawah ini atau kontak langsung.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Contact Form */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Kirim Pesan</h2>
            </div>

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <h3 className="text-xl font-semibold">Pesan Terkirim!</h3>
                <p className="text-muted-foreground text-center">
                  Terima kasih telah menghubungi kami. Kami akan merespons secepat mungkin.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="08xx-xxxx-xxxx"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subjek</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Topik pesan Anda"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Pesan</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tuliskan pesan Anda di sini..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Pesan
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 md:p-8 space-y-6">
              <h2 className="text-2xl font-bold mb-6">Informasi Kontak</h2>
              <div className="space-y-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{info.title}</h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-muted-foreground hover:text-primary transition"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-muted-foreground">{info.content}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Card */}
          <Card>
            <CardContent className="p-6 md:p-8 space-y-4">
              <h2 className="text-2xl font-bold mb-4">Pertanyaan Umum</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-1">Berapa lama waktu pengiriman?</h3>
                  <p className="text-muted-foreground">
                    Pengiriman biasanya memakan waktu 3-7 hari kerja tergantung lokasi tujuan.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Apakah produk dijamin asli?</h3>
                  <p className="text-muted-foreground">
                    Ya, semua produk kami langsung dari Desa Lamahang dengan sertifikasi resmi.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Bagaimana cara melakukan pengembalian?</h3>
                  <p className="text-muted-foreground">
                    Hubungi kami melalui form di atas atau email untuk proses pengembalian.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map Section Placeholder */}
      <section className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
              <div className="text-center space-y-2">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Peta Lokasi</p>
                <p className="text-sm text-muted-foreground">
                  Desa Lamahang, Kec. Waplau, Kab. Buru, Maluku
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
