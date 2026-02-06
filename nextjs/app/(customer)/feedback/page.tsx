'use client'

import React from "react"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Star } from 'lucide-react'

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    rating: 5,
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ rating: 5, subject: '', message: '' })
      setSubmitted(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-primary" />
          Berikan Feedback
        </h1>
        <p className="text-muted-foreground">Kami sangat menghargai masukan Anda untuk meningkatkan layanan</p>
      </div>

      {submitted && (
        <Card className="border-0 shadow-sm bg-green-50 border border-green-200">
          <CardContent className="pt-6">
            <p className="text-green-800 font-semibold text-center">✓ Feedback Anda telah diterima. Terima kasih!</p>
          </CardContent>
        </Card>
      )}

      {/* Feedback Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Form Feedback</CardTitle>
          <CardDescription>Bagikan pengalaman Anda berbelanja dengan kami</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label>Berapa rating untuk produk kami?</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subjek</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Masukkan subjek feedback"
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
                placeholder="Ceritakan pengalaman Anda dengan lebih detail..."
                value={formData.message}
                onChange={handleChange}
                rows={6}
                required
              />
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                💡 Tips: Jelaskan produk yang Anda beri rating dan saran spesifik untuk perbaikan akan sangat membantu kami.
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Kirim Feedback
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Feedback Terbaru</CardTitle>
          <CardDescription>Feedback dari pelanggan lain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm">Produk berkualitas!</h4>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Minyak kayu putih dari Lamahang benar-benar berkualitas premium. Aroma alami dan manfaatnya terasa sekali.
            </p>
            <p className="text-xs text-muted-foreground">- Budi Santoso, 2 hari lalu</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm">Sangat puas</h4>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= 4
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Pengiriman cepat dan produk sesuai dengan deskripsi. Akan membeli lagi!
            </p>
            <p className="text-xs text-muted-foreground">- Siti Nurhaliza, 5 hari lalu</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
