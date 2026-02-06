'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { User, Mail, Phone, MapPin, Plus, Edit2, Trash2, Check, CheckCircle2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Province {
  code: string
  name: string
}

interface Regency {
  code: string
  name: string
}

interface District {
  code: string
  name: string
}

interface Village {
  code: string
  name: string
}

interface Address {
  id: string
  label: string
  recipientName: string
  phone: string
  province: string
  regency: string
  district: string
  village: string
  detailAddress: string
  postalCode: string
  isActive: boolean
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  
  // Wilayah data states
  const [provinces, setProvinces] = useState<Province[]>([])
  const [regencies, setRegencies] = useState<Regency[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [villages, setVillages] = useState<Village[]>([])
  
  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingRegencies, setLoadingRegencies] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingVillages, setLoadingVillages] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [addressForm, setAddressForm] = useState({
    label: '',
    recipientName: '',
    phone: '',
    province: '',
    provinceCode: '',
    regency: '',
    regencyCode: '',
    district: '',
    districtCode: '',
    village: '',
    villageCode: '',
    detailAddress: '',
    postalCode: '',
  })

  // Load provinces on mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load addresses from localStorage
  useEffect(() => {
    const storedAddresses = localStorage.getItem('user_addresses')
    if (storedAddresses) {
      try {
        const parsed = JSON.parse(storedAddresses)
        setAddresses(parsed)
      } catch (error) {
        console.error('Failed to parse stored addresses:', error)
      }
    }
  }, [])

  // Save addresses to localStorage
  useEffect(() => {
    if (addresses.length > 0) {
      localStorage.setItem('user_addresses', JSON.stringify(addresses))
    }
  }, [addresses])

  // Load cascading data when editing address
  useEffect(() => {
    if (editingAddress && isAddressDialogOpen && provinces.length > 0) {
      const loadCascadingData = async () => {
        // Find province code
        const prov = provinces.find((p) => p.name === editingAddress.province)
        if (prov) {
          setAddressForm((prev) => ({ ...prev, provinceCode: prov.code }))
          const regenciesData = await fetch(`https://wilayah.id/api/regencies/${prov.code}.json`).then(r => r.json())
          setRegencies(regenciesData)
          
          // Find regency code
          const reg = regenciesData.find((r: Regency) => r.name === editingAddress.regency)
          if (reg) {
            setAddressForm((prev) => ({ ...prev, regencyCode: reg.code }))
            const districtsData = await fetch(`https://wilayah.id/api/districts/${reg.code}.json`).then(r => r.json())
            setDistricts(districtsData)
            
            // Find district code
            const dist = districtsData.find((d: District) => d.name === editingAddress.district)
            if (dist) {
              setAddressForm((prev) => ({ ...prev, districtCode: dist.code }))
              const villagesData = await fetch(`https://wilayah.id/api/villages/${dist.code}.json`).then(r => r.json())
              setVillages(villagesData)
              
              // Find village code
              const vil = villagesData.find((v: Village) => v.name === editingAddress.village)
              if (vil) {
                setAddressForm((prev) => ({ ...prev, villageCode: vil.code }))
              }
            }
          }
        }
      }
      loadCascadingData()
    }
  }, [editingAddress, isAddressDialogOpen, provinces])

  // Load provinces
  const loadProvinces = async () => {
    setLoadingProvinces(true)
    try {
      const response = await fetch('https://wilayah.id/api/provinces.json')
      const data = await response.json()
      setProvinces(data)
    } catch (error) {
      console.error('Failed to load provinces:', error)
    } finally {
      setLoadingProvinces(false)
    }
  }

  // Load regencies when province is selected
  const loadRegencies = async (provinceCode: string) => {
    if (!provinceCode) {
      setRegencies([])
      setDistricts([])
      setVillages([])
      return
    }
    setLoadingRegencies(true)
    try {
      const response = await fetch(`https://wilayah.id/api/regencies/${provinceCode}.json`)
      const data = await response.json()
      setRegencies(data)
      setDistricts([])
      setVillages([])
    } catch (error) {
      console.error('Failed to load regencies:', error)
    } finally {
      setLoadingRegencies(false)
    }
  }

  // Load districts when regency is selected
  const loadDistricts = async (regencyCode: string) => {
    if (!regencyCode) {
      setDistricts([])
      setVillages([])
      return
    }
    setLoadingDistricts(true)
    try {
      const response = await fetch(`https://wilayah.id/api/districts/${regencyCode}.json`)
      const data = await response.json()
      setDistricts(data)
      setVillages([])
    } catch (error) {
      console.error('Failed to load districts:', error)
    } finally {
      setLoadingDistricts(false)
    }
  }

  // Load villages when district is selected
  const loadVillages = async (districtCode: string) => {
    if (!districtCode) {
      setVillages([])
      return
    }
    setLoadingVillages(true)
    try {
      const response = await fetch(`https://wilayah.id/api/villages/${districtCode}.json`)
      const data = await response.json()
      setVillages(data)
    } catch (error) {
      console.error('Failed to load villages:', error)
    } finally {
      setLoadingVillages(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProvinceChange = (provinceCode: string) => {
    const selectedProvince = provinces.find((p) => p.code === provinceCode)
    setAddressForm((prev) => ({
      ...prev,
      province: selectedProvince?.name || '',
      provinceCode: provinceCode,
      regency: '',
      regencyCode: '',
      district: '',
      districtCode: '',
      village: '',
      villageCode: '',
    }))
    loadRegencies(provinceCode)
  }

  const handleRegencyChange = (regencyCode: string) => {
    const selectedRegency = regencies.find((r) => r.code === regencyCode)
    setAddressForm((prev) => ({
      ...prev,
      regency: selectedRegency?.name || '',
      regencyCode: regencyCode,
      district: '',
      districtCode: '',
      village: '',
      villageCode: '',
    }))
    loadDistricts(regencyCode)
  }

  const handleDistrictChange = (districtCode: string) => {
    const selectedDistrict = districts.find((d) => d.code === districtCode)
    setAddressForm((prev) => ({
      ...prev,
      district: selectedDistrict?.name || '',
      districtCode: districtCode,
      village: '',
      villageCode: '',
    }))
    loadVillages(districtCode)
  }

  const handleVillageChange = (villageCode: string) => {
    const selectedVillage = villages.find((v) => v.code === villageCode)
    setAddressForm((prev) => ({
      ...prev,
      village: selectedVillage?.name || '',
      villageCode: villageCode,
    }))
  }

  const handleSave = () => {
    // In a real app, this would save to the server
    setIsEditing(false)
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setAddressForm({
      label: '',
      recipientName: '',
      phone: '',
      province: '',
      provinceCode: '',
      regency: '',
      regencyCode: '',
      district: '',
      districtCode: '',
      village: '',
      villageCode: '',
      detailAddress: '',
      postalCode: '',
    })
    setRegencies([])
    setDistricts([])
    setVillages([])
    setIsAddressDialogOpen(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      province: address.province,
      provinceCode: '',
      regency: address.regency,
      regencyCode: '',
      district: address.district,
      districtCode: '',
      village: address.village,
      villageCode: '',
      detailAddress: address.detailAddress,
      postalCode: address.postalCode,
    })
    setIsAddressDialogOpen(true)
  }

  const handleSaveAddress = () => {
    if (
      !addressForm.label ||
      !addressForm.recipientName ||
      !addressForm.phone ||
      !addressForm.province ||
      !addressForm.regency ||
      !addressForm.district ||
      !addressForm.village ||
      !addressForm.detailAddress
    ) {
      return
    }

    if (editingAddress) {
      // Update existing address
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddress.id
            ? {
                id: editingAddress.id,
                label: addressForm.label,
                recipientName: addressForm.recipientName,
                phone: addressForm.phone,
                province: addressForm.province,
                regency: addressForm.regency,
                district: addressForm.district,
                village: addressForm.village,
                detailAddress: addressForm.detailAddress,
                postalCode: addressForm.postalCode,
                isActive: addr.isActive,
              }
            : addr
        )
      )
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now().toString(),
        label: addressForm.label,
        recipientName: addressForm.recipientName,
        phone: addressForm.phone,
        province: addressForm.province,
        regency: addressForm.regency,
        district: addressForm.district,
        village: addressForm.village,
        detailAddress: addressForm.detailAddress,
        postalCode: addressForm.postalCode,
        isActive: addresses.length === 0, // First address is active by default
      }
      setAddresses((prev) => [...prev, newAddress])
    }

    setIsAddressDialogOpen(false)
    setEditingAddress(null)
    setAddressForm({
      label: '',
      recipientName: '',
      phone: '',
      province: '',
      provinceCode: '',
      regency: '',
      regencyCode: '',
      district: '',
      districtCode: '',
      village: '',
      villageCode: '',
      detailAddress: '',
      postalCode: '',
    })
    setRegencies([])
    setDistricts([])
    setVillages([])
  }

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((addr) => addr.id !== id)
      // If deleted address was active, make first address active
      const wasActive = prev.find((addr) => addr.id === id)?.isActive
      if (wasActive && filtered.length > 0) {
        filtered[0].isActive = true
      }
      return filtered
    })
  }

  const handleSetActiveAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isActive: addr.id === id,
      }))
    )
  }

  const activeAddress = addresses.find((addr) => addr.isActive)

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Profil Saya</h1>
        <p className="text-muted-foreground">Kelola informasi akun pribadi Anda</p>
      </div>

      {/* Profile Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-lg font-bold bg-primary text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{user?.fullName}</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Member sejak {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="w-full md:w-auto">
              Edit Profil
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
          <CardDescription>Update informasi akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-muted text-muted-foreground rounded-lg border border-input">
                  +62
                </span>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="812 3456 7890"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  Simpan Perubahan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Alamat Pengiriman
              </CardTitle>
              <CardDescription>Kelola alamat pengiriman Anda</CardDescription>
            </div>
            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddAddress} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Alamat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    Lengkapi informasi alamat pengiriman Anda
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Label Alamat *</Label>
                    <Input
                      id="label"
                      name="label"
                      placeholder="Rumah, Kantor, Kos, dll"
                      value={addressForm.label}
                      onChange={handleAddressChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Nama Penerima *</Label>
                    <Input
                      id="recipientName"
                      name="recipientName"
                      placeholder="Nama lengkap penerima"
                      value={addressForm.recipientName}
                      onChange={handleAddressChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressPhone">Nomor Telepon *</Label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-muted text-muted-foreground rounded-lg border border-input">
                        +62
                      </span>
                      <Input
                        id="addressPhone"
                        name="phone"
                        placeholder="812 3456 7890"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Provinsi *</Label>
                    <Select
                      value={addressForm.provinceCode}
                      onValueChange={handleProvinceChange}
                      disabled={loadingProvinces}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingProvinces ? "Memuat..." : "Pilih Provinsi"} />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.code} value={province.code}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regency">Kabupaten/Kota *</Label>
                    <Select
                      value={addressForm.regencyCode}
                      onValueChange={handleRegencyChange}
                      disabled={!addressForm.provinceCode || loadingRegencies}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            !addressForm.provinceCode 
                              ? "Pilih Provinsi terlebih dahulu" 
                              : loadingRegencies 
                              ? "Memuat..." 
                              : "Pilih Kabupaten/Kota"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {regencies.map((regency) => (
                          <SelectItem key={regency.code} value={regency.code}>
                            {regency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">Kecamatan *</Label>
                    <Select
                      value={addressForm.districtCode}
                      onValueChange={handleDistrictChange}
                      disabled={!addressForm.regencyCode || loadingDistricts}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            !addressForm.regencyCode 
                              ? "Pilih Kabupaten/Kota terlebih dahulu" 
                              : loadingDistricts 
                              ? "Memuat..." 
                              : "Pilih Kecamatan"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.code} value={district.code}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="village">Desa/Kelurahan *</Label>
                    <Select
                      value={addressForm.villageCode}
                      onValueChange={handleVillageChange}
                      disabled={!addressForm.districtCode || loadingVillages}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            !addressForm.districtCode 
                              ? "Pilih Kecamatan terlebih dahulu" 
                              : loadingVillages 
                              ? "Memuat..." 
                              : "Pilih Desa/Kelurahan"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {villages.map((village) => (
                          <SelectItem key={village.code} value={village.code}>
                            {village.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="detailAddress">Detail Alamat Lengkap *</Label>
                    <Textarea
                      id="detailAddress"
                      name="detailAddress"
                      placeholder="Nama jalan, nomor rumah, nama gedung, RT/RW, dll"
                      rows={3}
                      value={addressForm.detailAddress}
                      onChange={handleAddressChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Kode Pos</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      placeholder="12345"
                      value={addressForm.postalCode}
                      onChange={handleAddressChange}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleSaveAddress} 
                      className="flex-1" 
                      disabled={
                        !addressForm.label || 
                        !addressForm.recipientName || 
                        !addressForm.phone || 
                        !addressForm.province || 
                        !addressForm.regency || 
                        !addressForm.district || 
                        !addressForm.village || 
                        !addressForm.detailAddress
                      }
                    >
                      {editingAddress ? 'Simpan Perubahan' : 'Simpan Alamat'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddressDialogOpen(false)
                        setEditingAddress(null)
                        setAddressForm({
                          label: '',
                          recipientName: '',
                          phone: '',
                          province: '',
                          provinceCode: '',
                          regency: '',
                          regencyCode: '',
                          district: '',
                          districtCode: '',
                          village: '',
                          villageCode: '',
                          detailAddress: '',
                          postalCode: '',
                        })
                        setRegencies([])
                        setDistricts([])
                        setVillages([])
                      }}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Belum ada alamat pengiriman</p>
              <Button onClick={handleAddAddress} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Alamat Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-4 transition ${
                    address.isActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{address.label}</h4>
                      {address.isActive && (
                        <Badge className="bg-primary text-primary-foreground">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Aktif
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!address.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetActiveAddress(address.id)}
                          title="Set sebagai alamat aktif"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                        title="Edit alamat"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id)}
                        title="Hapus alamat"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{address.recipientName}</p>
                    <p className="text-muted-foreground">{address.phone}</p>
                    <p className="text-muted-foreground">{address.detailAddress}</p>
                    <p className="text-muted-foreground">
                      {address.village}, {address.district}, {address.regency}, {address.province}
                      {address.postalCode && ` ${address.postalCode}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
