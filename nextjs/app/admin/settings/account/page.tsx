'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserCog, Save, Key, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/app/context/auth-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  getAdminToken,
  isApiConfigured,
  fetchAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
} from '@/lib/api'

export default function AccountSettingsPage() {
  const { user } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  })

  const useApi = isApiConfigured() && !!getAdminToken()

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
      })
    }
  }, [user])

  // Sync profil dari Laravel saat halaman dibuka (jika pakai API)
  useEffect(() => {
    if (!user || !useApi) return
    const token = getAdminToken()
    if (!token) return
    fetchAdminProfile(token).then((res) => {
      if (res?.user) {
        setProfileData({
          fullName: res.user.fullName || '',
          email: res.user.email || '',
        })
      }
    })
  }, [user?.email, useApi])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setMessage(null)
  }

  const handleSaveProfile = async () => {
    if (!profileData.fullName.trim()) {
      setMessage({ type: 'error', text: 'Nama lengkap tidak boleh kosong' })
      return
    }

    if (useApi) {
      setIsLoading(true)
      setMessage(null)
      try {
        const token = getAdminToken()
        const res = await updateAdminProfile(token, { full_name: profileData.fullName.trim() })
        if (res.user) {
          const updatedUser = { ...user, fullName: res.user.fullName }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui' })
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal memperbarui profil' })
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Fallback: localStorage
    const adminsJson = localStorage.getItem('admins') || '[]'
    const admins = JSON.parse(adminsJson)
    const adminIndex = admins.findIndex((a: any) => a.email === user?.email)
    if (adminIndex !== -1) {
      admins[adminIndex].fullName = profileData.fullName
      localStorage.setItem('admins', JSON.stringify(admins))
      const updatedUser = { ...user, fullName: profileData.fullName }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui' })
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Semua field password harus diisi' })
      return
    }
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' })
      return
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Password baru dan konfirmasi password tidak sama' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    if (useApi) {
      try {
        const token = getAdminToken()
        await updateAdminPassword(token, {
          current_password: formData.currentPassword,
          password: formData.newPassword,
          password_confirmation: formData.confirmPassword,
        })
        setMessage({ type: 'success', text: 'Password berhasil diubah' })
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal mengubah password' })
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Fallback: localStorage
    const adminsJson = localStorage.getItem('admins') || '[]'
    const admins = JSON.parse(adminsJson)
    const admin = admins.find((a: any) => a.email === user?.email)
    if (!admin || admin.password !== formData.currentPassword) {
      setMessage({ type: 'error', text: 'Password saat ini salah' })
      setIsLoading(false)
      return
    }
    const adminIndex = admins.findIndex((a: any) => a.email === user?.email)
    if (adminIndex !== -1) {
      admins[adminIndex].password = formData.newPassword
      localStorage.setItem('admins', JSON.stringify(admins))
      setMessage({ type: 'success', text: 'Password berhasil diubah' })
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Akun</h1>
        <p className="text-muted-foreground">Kelola informasi akun dan keamanan admin Anda</p>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Informasi Profil
          </CardTitle>
          <CardDescription>Update informasi profil akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email tidak dapat diubah
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              name="fullName"
              value={profileData.fullName}
              onChange={handleProfileChange}
              placeholder="Masukkan nama lengkap"
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveProfile} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Ubah Password
          </CardTitle>
          <CardDescription>Ganti password untuk meningkatkan keamanan akun</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Saat Ini</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Masukkan password saat ini"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Masukkan password baru (min. 6 karakter)"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password minimal 6 karakter
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Konfirmasi password baru"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleChangePassword} disabled={isLoading}>
              <Key className="w-4 h-4 mr-2" />
              {isLoading ? 'Mengubah...' : 'Ubah Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
          <CardDescription>Detail informasi akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <p className="font-medium mt-1">{user?.role || 'admin'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Tanggal Bergabung</Label>
              <p className="font-medium mt-1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
