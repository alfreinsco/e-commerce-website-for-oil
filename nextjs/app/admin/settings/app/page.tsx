'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Save, Globe, Bell, Shield, AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getAdminToken, isApiConfigured, appGetSettings, appUpdateSettings } from '@/lib/api'

const initialSettings = {
  siteName: 'E-Commerce Lamahang',
  siteDescription: 'Toko online minyak kayu putih premium dari Desa Lamahang',
  siteTagline: 'Produk Alami untuk Kesehatan Keluarga',
  contactEmail: 'info@lamahang.com',
  contactPhone: '+62 812-3456-7890',
  address: 'Desa Lamahang, Kec. Waplau, Kab. Buru, Maluku',
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  whatsappNumber: '',
  emailNotifications: true,
  orderNotifications: true,
  lowStockNotifications: true,
  paymentNotifications: true,
  customerNotifications: false,
  freeShippingThreshold: 100000,
  defaultShippingCost: 20000,
  taxRate: 11,
  taxEnabled: true,
  maintenanceMode: false,
  maintenanceMessage: 'Situs sedang dalam maintenance. Kami akan kembali segera.',
  metaTitle: 'E-Commerce Lamahang - Minyak Kayu Putih Premium',
  metaDescription: 'Toko online minyak kayu putih premium dari Desa Lamahang, Kecamatan Waplau, Kabupaten Buru, Maluku',
  metaKeywords: 'minyak kayu putih, lamahang, produk alami, kesehatan',
}

export default function AppSettingsPage() {
  const [settings, setSettings] = useState(initialSettings)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const mergeFromApi = useCallback((data: Partial<typeof initialSettings>) => {
    setSettings((prev) => {
      const next = { ...prev }
      const keys = Object.keys(initialSettings) as (keyof typeof initialSettings)[]
      keys.forEach((k) => {
        if (data[k] !== undefined) {
          (next as Record<string, unknown>)[k] = data[k]
        }
      })
      return next
    })
  }, [])

  useEffect(() => {
    if (isApiConfigured() && getAdminToken()) {
      setLoading(true)
      appGetSettings(getAdminToken())
        .then(mergeFromApi)
        .catch(() => {
          try {
            const stored = localStorage.getItem('admin_settings')
            if (stored) mergeFromApi(JSON.parse(stored))
          } catch {
            // ignore
          }
        })
        .finally(() => setLoading(false))
      return
    }
    try {
      const stored = localStorage.getItem('admin_settings')
      if (stored) setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }))
    } catch (error) {
      console.error('Failed to parse stored settings:', error)
    }
    setLoading(false)
  }, [mergeFromApi])

  const handleChange = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setMessage(null)
  }

  const handleSave = async () => {
    setMessage(null)
    if (isApiConfigured() && getAdminToken()) {
      setSaving(true)
      try {
        const num = (v: number, fallback: number) =>
          typeof v === 'number' && !Number.isNaN(v) ? v : fallback
        const payload = {
          ...settings,
          freeShippingThreshold: num(settings.freeShippingThreshold, 100000),
          defaultShippingCost: num(settings.defaultShippingCost, 20000),
          taxRate: num(settings.taxRate, 11),
        }
        const updated = await appUpdateSettings(getAdminToken(), payload)
        mergeFromApi(updated as Partial<typeof initialSettings>)
        setMessage({ type: 'success', text: 'Pengaturan aplikasi berhasil disimpan!' })
        setTimeout(() => setMessage(null), 3000)
      } catch (e) {
        setMessage({
          type: 'error',
          text: e instanceof Error ? e.message : 'Gagal menyimpan pengaturan aplikasi.',
        })
      } finally {
        setSaving(false)
      }
      return
    }
    try {
      localStorage.setItem('admin_settings', JSON.stringify(settings))
      setMessage({ type: 'success', text: 'Pengaturan aplikasi berhasil disimpan!' })
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: 'error', text: 'Gagal menyimpan ke penyimpanan lokal.' })
    }
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
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Aplikasi</h1>
        <p className="text-muted-foreground">Kelola konfigurasi dan pengaturan aplikasi</p>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {message.type === 'success' ? (
            <AlertCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Simpan Semua Pengaturan
            </>
          )}
        </Button>
      </div>

      {/* General Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Pengaturan Umum
          </CardTitle>
          <CardDescription>Informasi dasar tentang aplikasi dan toko</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nama Toko</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteTagline">Tagline</Label>
            <Input
              id="siteTagline"
              value={settings.siteTagline}
              onChange={(e) => handleChange('siteTagline', e.target.value)}
              placeholder="Slogan atau tagline toko"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Deskripsi Toko</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email Kontak</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Telepon Kontak</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Media Sosial
          </CardTitle>
          <CardDescription>Link media sosial toko</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                type="url"
                value={settings.facebookUrl}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/lamahang"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                type="url"
                value={settings.instagramUrl}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/lamahang"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitterUrl">Twitter URL</Label>
              <Input
                id="twitterUrl"
                type="url"
                value={settings.twitterUrl}
                onChange={(e) => handleChange('twitterUrl', e.target.value)}
                placeholder="https://twitter.com/lamahang"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                value={settings.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="6281234567890"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Pengaturan Notifikasi
          </CardTitle>
          <CardDescription>Kelola notifikasi yang ingin diterima</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifikasi Email</Label>
              <p className="text-sm text-muted-foreground">
                Aktifkan semua notifikasi melalui email
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifikasi Pesanan Baru</Label>
              <p className="text-sm text-muted-foreground">
                Dapatkan notifikasi saat ada pesanan baru
              </p>
            </div>
            <Switch
              checked={settings.orderNotifications}
              onCheckedChange={(checked) => handleChange('orderNotifications', checked)}
              disabled={!settings.emailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifikasi Stok Rendah</Label>
              <p className="text-sm text-muted-foreground">
                Dapatkan notifikasi saat stok produk rendah
              </p>
            </div>
            <Switch
              checked={settings.lowStockNotifications}
              onCheckedChange={(checked) => handleChange('lowStockNotifications', checked)}
              disabled={!settings.emailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifikasi Pembayaran</Label>
              <p className="text-sm text-muted-foreground">
                Dapatkan notifikasi saat ada pembayaran baru
              </p>
            </div>
            <Switch
              checked={settings.paymentNotifications}
              onCheckedChange={(checked) => handleChange('paymentNotifications', checked)}
              disabled={!settings.emailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifikasi Pelanggan Baru</Label>
              <p className="text-sm text-muted-foreground">
                Dapatkan notifikasi saat ada pelanggan baru mendaftar
              </p>
            </div>
            <Switch
              checked={settings.customerNotifications}
              onCheckedChange={(checked) => handleChange('customerNotifications', checked)}
              disabled={!settings.emailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Tax Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Pengaturan Pengiriman
            </CardTitle>
            <CardDescription>Konfigurasi biaya pengiriman</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="freeShippingThreshold">Batas Gratis Ongkir (Rp)</Label>
              <Input
                id="freeShippingThreshold"
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => handleChange('freeShippingThreshold', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Pesanan di atas jumlah ini akan mendapatkan gratis ongkir
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultShippingCost">Ongkos Kirim Default (Rp)</Label>
              <Input
                id="defaultShippingCost"
                type="number"
                value={settings.defaultShippingCost}
                onChange={(e) => handleChange('defaultShippingCost', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Biaya pengiriman default jika tidak memenuhi batas gratis ongkir
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Pengaturan Pajak
            </CardTitle>
            <CardDescription>Konfigurasi tarif pajak</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Aktifkan Pajak</Label>
                <p className="text-sm text-muted-foreground">
                  Aktifkan perhitungan pajak pada transaksi
                </p>
              </div>
              <Switch
                checked={settings.taxEnabled}
                onCheckedChange={(checked) => handleChange('taxEnabled', checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tarif Pajak (PPN) (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                disabled={!settings.taxEnabled}
              />
              <p className="text-xs text-muted-foreground">
                Tarif PPN yang akan dikenakan pada setiap transaksi
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Pengaturan SEO
          </CardTitle>
          <CardDescription>Optimasi untuk mesin pencari</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={settings.metaTitle}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              placeholder="Judul untuk SEO"
            />
            <p className="text-xs text-muted-foreground">
              Judul yang akan muncul di hasil pencarian (maksimal 60 karakter)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={settings.metaDescription}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              rows={3}
              placeholder="Deskripsi untuk SEO"
            />
            <p className="text-xs text-muted-foreground">
              Deskripsi yang akan muncul di hasil pencarian (maksimal 160 karakter)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaKeywords">Meta Keywords</Label>
            <Input
              id="metaKeywords"
              value={settings.metaKeywords}
              onChange={(e) => handleChange('metaKeywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-muted-foreground">
              Kata kunci untuk SEO (pisahkan dengan koma)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card className="border-0 shadow-sm border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Mode Maintenance
          </CardTitle>
          <CardDescription>Aktifkan mode maintenance untuk melakukan maintenance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode Maintenance</Label>
              <p className="text-sm text-muted-foreground">
                Aktifkan untuk melakukan maintenance pada sistem. Situs akan tidak dapat diakses oleh pengunjung.
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleChange('maintenanceMode', checked)}
            />
          </div>
          {settings.maintenanceMode && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="maintenanceMessage">Pesan Maintenance</Label>
              <Textarea
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                rows={3}
                placeholder="Pesan yang akan ditampilkan saat maintenance"
              />
              <p className="text-xs text-muted-foreground">
                Pesan ini akan ditampilkan kepada pengunjung saat mode maintenance aktif
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Simpan Semua Pengaturan
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
