'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { SearchableSelect } from '@/components/ui/searchable-select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MapPin, Loader2, Plus, Trash2 } from 'lucide-react'
import {
  getAdminToken,
  isApiConfigured,
  addressStoreVillageFromWilayah,
  addressGetVillages,
  addressUpdateVillage,
  addressDeleteVillage,
  type ApiVillage,
} from '@/lib/api'

/** Pakai proxy Next.js untuk hindari CORS saat fetch dari browser */
const WILAYAH_API = '/api/wilayah'

interface WilayahItem {
  code: string
  name: string
}

async function fetchWilayah<T>(url: string): Promise<T[]> {
  const res = await fetch(url)
  const json = await res.json()
  const data = json?.data
  return Array.isArray(data) ? data : []
}

export default function AddressSettingsPage() {
  const [provinces, setProvinces] = useState<WilayahItem[]>([])
  const [regencies, setRegencies] = useState<WilayahItem[]>([])
  const [districts, setDistricts] = useState<WilayahItem[]>([])
  const [villages, setVillages] = useState<WilayahItem[]>([])

  const [provinceCode, setProvinceCode] = useState<string>('')
  const [regencyCode, setRegencyCode] = useState<string>('')
  const [districtCode, setDistrictCode] = useState<string>('')
  const [villageCode, setVillageCode] = useState<string>('')

  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingRegencies, setLoadingRegencies] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingVillages, setLoadingVillages] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [supportsCod, setSupportsCod] = useState(false)

  const [dbVillages, setDbVillages] = useState<ApiVillage[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteVillage, setDeleteVillage] = useState<ApiVillage | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingVillageId, setTogglingVillageId] = useState<string | null>(null)

  const loadDbVillages = useCallback(() => {
    const token = getAdminToken()
    if (!isApiConfigured() || !token) return
    setLoadingList(true)
    addressGetVillages(token)
      .then(setDbVillages)
      .catch(() => setDbVillages([]))
      .finally(() => setLoadingList(false))
  }, [])

  useEffect(() => {
    loadDbVillages()
  }, [loadDbVillages])

  useEffect(() => {
    setLoadingProvinces(true)
    fetchWilayah<WilayahItem>(`${WILAYAH_API}/provinces.json`)
      .then(setProvinces)
      .catch(() => setProvinces([]))
      .finally(() => setLoadingProvinces(false))
  }, [])

  const loadRegencies = useCallback((code: string) => {
    if (!code) {
      setRegencies([])
      setRegencyCode('')
      setDistrictCode('')
      setVillageCode('')
      setDistricts([])
      setVillages([])
      return
    }
    setRegencyCode('')
    setDistrictCode('')
    setVillageCode('')
    setDistricts([])
    setVillages([])
    setLoadingRegencies(true)
    fetchWilayah<WilayahItem>(`${WILAYAH_API}/regencies/${code}.json`)
      .then(setRegencies)
      .catch(() => setRegencies([]))
      .finally(() => setLoadingRegencies(false))
  }, [])

  const loadDistricts = useCallback((code: string) => {
    if (!code) {
      setDistricts([])
      setDistrictCode('')
      setVillageCode('')
      setVillages([])
      return
    }
    setDistrictCode('')
    setVillageCode('')
    setVillages([])
    setLoadingDistricts(true)
    fetchWilayah<WilayahItem>(`${WILAYAH_API}/districts/${code}.json`)
      .then(setDistricts)
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false))
  }, [])

  const loadVillages = useCallback((code: string) => {
    if (!code) {
      setVillages([])
      setVillageCode('')
      return
    }
    setVillageCode('')
    setLoadingVillages(true)
    fetchWilayah<WilayahItem>(`${WILAYAH_API}/villages/${code}.json`)
      .then(setVillages)
      .catch(() => setVillages([]))
      .finally(() => setLoadingVillages(false))
  }, [])

  useEffect(() => {
    if (provinceCode) loadRegencies(provinceCode)
    else {
      setRegencies([])
      setRegencyCode('')
      setDistrictCode('')
      setVillageCode('')
      setDistricts([])
      setVillages([])
    }
  }, [provinceCode, loadRegencies])

  useEffect(() => {
    if (regencyCode) loadDistricts(regencyCode)
    else {
      setDistricts([])
      setDistrictCode('')
      setVillageCode('')
      setVillages([])
    }
  }, [regencyCode, loadDistricts])

  useEffect(() => {
    if (districtCode) loadVillages(districtCode)
    else {
      setVillages([])
      setVillageCode('')
    }
  }, [districtCode, loadVillages])

  const handleSubmit = async () => {
    if (!provinceCode || !regencyCode || !districtCode || !villageCode) {
      setMessage({ type: 'error', text: 'Pilih provinsi, kabupaten, kecamatan, dan desa.' })
      return
    }

    if (!isApiConfigured()) {
      setMessage({ type: 'error', text: 'API backend belum dikonfigurasi (NEXT_PUBLIC_API_URL).' })
      return
    }

    const token = getAdminToken()
    if (!token) {
      setMessage({ type: 'error', text: 'Anda harus login sebagai admin.' })
      return
    }

    const province = provinces.find((p) => p.code === provinceCode)
    const regency = regencies.find((r) => r.code === regencyCode)
    const district = districts.find((d) => d.code === districtCode)
    const village = villages.find((v) => v.code === villageCode)

    if (!province || !regency || !district || !village) {
      setMessage({ type: 'error', text: 'Data wilayah tidak lengkap.' })
      return
    }

    setSubmitting(true)
    setMessage(null)
    try {
      await addressStoreVillageFromWilayah(token, {
        province: { code: province.code, name: province.name },
        regency: { code: regency.code, name: regency.name },
        district: { code: district.code, name: district.name },
        village: { code: village.code, name: village.name, supports_cod: supportsCod },
      })
      setMessage({ type: 'success', text: `Desa "${village.name}" berhasil ditambahkan.` })
      setVillageCode('')
      setSupportsCod(false)
      setAddDialogOpen(false)
      loadDbVillages()
    } catch (e) {
      setMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Gagal menyimpan. Periksa koneksi dan login.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit =
    !!provinceCode &&
    !!regencyCode &&
    !!districtCode &&
    !!villageCode &&
    isApiConfigured() &&
    !!getAdminToken()

  const handleToggleCod = async (v: ApiVillage) => {
    const token = getAdminToken()
    if (!token) return
    setTogglingVillageId(v.id)
    try {
      await addressUpdateVillage(token, v.id, { supports_cod: !v.supportsCOD })
      setDbVillages((prev) =>
        prev.map((item) =>
          item.id === v.id ? { ...item, supportsCOD: !item.supportsCOD } : item
        )
      )
    } catch (e) {
      setMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Gagal mengubah status COD.',
      })
    } finally {
      setTogglingVillageId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteVillage) return
    const token = getAdminToken()
    if (!token) return
    setDeleting(true)
    try {
      await addressDeleteVillage(token, deleteVillage.id)
      setDeleteVillage(null)
      loadDbVillages()
      setMessage({ type: 'success', text: 'Desa berhasil dihapus.' })
    } catch (e) {
      setMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Gagal menghapus desa.',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Alamat</h1>
        <p className="text-muted-foreground">
          Kelola desa/kelurahan dari database. Tambah dari{' '}
          <a
            href="https://wilayah.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            wilayah.id
          </a>
          , atur Bisa COD atau hapus desa yang sudah ada.
        </p>
      </div>

      {message && (
        <p
          className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-destructive'}`}
        >
          {message.text}
        </p>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Daftar Desa
            </CardTitle>
            <CardDescription>Desa/kelurahan yang tersimpan di database</CardDescription>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} disabled={!isApiConfigured() || !getAdminToken()}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Desa
          </Button>
        </CardHeader>
        <CardContent>
          {loadingList ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Desa</TableHead>
                  <TableHead>Kecamatan</TableHead>
                  <TableHead>Kabupaten</TableHead>
                  <TableHead>Bisa COD</TableHead>
                  <TableHead className="w-[80px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbVillages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Belum ada desa. Klik &quot;Tambah Desa&quot; untuk menambah dari wilayah.id.
                    </TableCell>
                  </TableRow>
                ) : (
                  dbVillages.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono text-xs">{v.code}</TableCell>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.districtName}</TableCell>
                      <TableCell>{v.regencyName}</TableCell>
                      <TableCell>
                        <Switch
                          checked={v.supportsCOD}
                          onCheckedChange={() => handleToggleCod(v)}
                          disabled={togglingVillageId === v.id}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteVillage(v)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Tambah Desa */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Desa</DialogTitle>
            <DialogDescription>
              Pilih wilayah dari wilayah.id. Centang &quot;Bisa COD&quot; jika desa ini mendukung pembayaran COD.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Provinsi</Label>
                <SearchableSelect
                  options={provinces.map((p) => ({ value: p.code, label: p.name }))}
                  value={provinceCode}
                  onValueChange={setProvinceCode}
                  placeholder={loadingProvinces ? 'Memuat...' : 'Pilih provinsi'}
                  disabled={loadingProvinces}
                  searchPlaceholder="Cari provinsi..."
                />
              </div>
              <div className="space-y-2">
                <Label>Kabupaten / Kota</Label>
                <SearchableSelect
                  options={regencies.map((r) => ({ value: r.code, label: r.name }))}
                  value={regencyCode}
                  onValueChange={setRegencyCode}
                  placeholder={
                    !provinceCode ? 'Pilih provinsi dulu' : loadingRegencies ? 'Memuat...' : 'Pilih kabupaten/kota'
                  }
                  disabled={!provinceCode || loadingRegencies}
                  searchPlaceholder="Cari kabupaten/kota..."
                />
              </div>
              <div className="space-y-2">
                <Label>Kecamatan</Label>
                <SearchableSelect
                  options={districts.map((d) => ({ value: d.code, label: d.name }))}
                  value={districtCode}
                  onValueChange={setDistrictCode}
                  placeholder={
                    !regencyCode ? 'Pilih kabupaten dulu' : loadingDistricts ? 'Memuat...' : 'Pilih kecamatan'
                  }
                  disabled={!regencyCode || loadingDistricts}
                  searchPlaceholder="Cari kecamatan..."
                />
              </div>
              <div className="space-y-2">
                <Label>Desa / Kelurahan</Label>
                <SearchableSelect
                  options={villages.map((v) => ({ value: v.code, label: v.name }))}
                  value={villageCode}
                  onValueChange={setVillageCode}
                  placeholder={
                    !districtCode ? 'Pilih kecamatan dulu' : loadingVillages ? 'Memuat...' : 'Pilih desa/kelurahan'
                  }
                  disabled={!districtCode || loadingVillages}
                  searchPlaceholder="Cari desa/kelurahan..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="supports-cod"
                checked={supportsCod}
                onCheckedChange={(checked) => setSupportsCod(checked === true)}
              />
              <Label htmlFor="supports-cod" className="cursor-pointer font-normal">
                Bisa COD (pembayaran di tempat)
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Desa'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Hapus */}
      <AlertDialog open={!!deleteVillage} onOpenChange={(open) => !open && setDeleteVillage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus desa?</AlertDialogTitle>
            <AlertDialogDescription>
              Desa &quot;{deleteVillage?.name}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
