'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Settings, Bell, Lock, Eye } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    twoFactor: false,
    activityLog: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary" />
          Pengaturan
        </h1>
        <p className="text-muted-foreground">Kelola preferensi dan keamanan akun Anda</p>
      </div>

      {/* Notification Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifikasi
          </CardTitle>
          <CardDescription>Pilih bagaimana Anda ingin menerima notifikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Email Notification</Label>
              <p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Notifikasi SMS</Label>
              <p className="text-sm text-muted-foreground">Terima notifikasi melalui SMS</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={() => handleToggle('smsNotifications')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Push Notification</Label>
              <p className="text-sm text-muted-foreground">Terima push notification di perangkat Anda</p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={() => handleToggle('pushNotifications')}
            />
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-4">Tipe Notifikasi</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Update Pesanan</Label>
                <Switch
                  checked={settings.orderUpdates}
                  onCheckedChange={() => handleToggle('orderUpdates')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Promosi & Penawaran Khusus</Label>
                <Switch
                  checked={settings.promotions}
                  onCheckedChange={() => handleToggle('promotions')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Newsletter Mingguan</Label>
                <Switch
                  checked={settings.newsletter}
                  onCheckedChange={() => handleToggle('newsletter')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Keamanan
          </CardTitle>
          <CardDescription>Jaga keamanan akun Anda tetap terjaga</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Autentikasi Dua Faktor (2FA)</Label>
              <p className="text-sm text-muted-foreground">Tambahan keamanan untuk akun Anda</p>
            </div>
            <Switch
              checked={settings.twoFactor}
              onCheckedChange={() => handleToggle('twoFactor')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Aktivitas Login</Label>
              <p className="text-sm text-muted-foreground">Pantau aktivitas login terbaru</p>
            </div>
            <Switch
              checked={settings.activityLog}
              onCheckedChange={() => handleToggle('activityLog')}
            />
          </div>

          <Separator />

          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
            <Eye className="w-4 h-4" />
            Lihat Aktivitas Login Terbaru
          </Button>

          <Button variant="outline" className="w-full bg-transparent">
            Ubah Password
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Privasi & Data</CardTitle>
          <CardDescription>Kelola data dan privasi Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full bg-transparent">
            Unduh Data Saya
          </Button>
          <Button variant="outline" className="w-full bg-transparent">
            Lihat Kebijakan Privasi
          </Button>
          <Button variant="outline" className="w-full bg-transparent">
            Lihat Syarat & Ketentuan
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 shadow-sm border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-red-700">Zona Berbahaya</CardTitle>
          <CardDescription>Aksi yang tidak dapat dibatalkan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-100 bg-transparent">
            Hapus Akun
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
