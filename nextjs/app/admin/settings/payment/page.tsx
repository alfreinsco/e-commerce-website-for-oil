"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Wallet,
  Truck,
  Banknote,
  AlertCircle,
  Shield,
  KeyRound,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getAdminToken,
  isApiConfigured,
  paymentGetSettings,
  paymentUpdateSettings,
} from "@/lib/api";

export interface EWalletMethod {
  id: string;
  name: string;
  enabled: boolean;
  feePercent: number;
}

const DEFAULT_EWALLET_METHODS: EWalletMethod[] = [
  { id: "gopay", name: "GoPay", enabled: true, feePercent: 2 },
  { id: "qris", name: "QRIS", enabled: true, feePercent: 0.7 },
  { id: "shopee_pay", name: "ShopeePay", enabled: true, feePercent: 2 },
  { id: "dana", name: "Dana", enabled: true, feePercent: 1.5 },
];

interface PaymentSettings {
  // E-Wallet Settings
  eWalletEnabled: boolean;
  eWalletMethods: EWalletMethod[];

  // COD Settings
  codEnabled: boolean;
  codMinOrder: number;
  codMaxOrder: number;
  codFee: number;

  // Virtual Account Settings
  virtualAccountEnabled: boolean;
  virtualAccountFee: number; // Rp per transaksi

  // Midtrans Credentials
  midtransServerKey: string;
  midtransClientKey: string;
  midtransIsProduction: boolean;

  // General Payment Settings
  paymentTimeout: number; // in minutes
  autoApprovePayment: boolean;
  requirePaymentProof: boolean;
  paymentProofRequired: boolean;
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    eWalletEnabled: true,
    eWalletMethods: DEFAULT_EWALLET_METHODS.map((m) => ({ ...m })),
    codEnabled: true,
    codMinOrder: 50000,
    codMaxOrder: 5000000,
    codFee: 0,
    virtualAccountEnabled: true,
    virtualAccountFee: 4000,
    midtransServerKey: "",
    midtransClientKey: "",
    midtransIsProduction: false,
    paymentTimeout: 24,
    autoApprovePayment: false,
    requirePaymentProof: true,
    paymentProofRequired: true,
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const mergeSettingsFromApi = useCallback(
    (data: {
      eWalletEnabled?: boolean;
      eWalletMethods?: EWalletMethod[];
      codEnabled?: boolean;
      codMinOrder?: number;
      codMaxOrder?: number;
      codFee?: number;
      virtualAccountEnabled?: boolean;
      virtualAccountFee?: number;
      midtransServerKey?: string;
      midtransClientKey?: string;
      midtransIsProduction?: boolean;
      paymentTimeout?: number;
      autoApprovePayment?: boolean;
      requirePaymentProof?: boolean;
      paymentProofRequired?: boolean;
    }) => {
      setSettings((prev) => {
        const next = { ...prev };
        if (data.eWalletEnabled !== undefined)
          next.eWalletEnabled = data.eWalletEnabled;
        if (
          data.eWalletMethods !== undefined &&
          Array.isArray(data.eWalletMethods) &&
          data.eWalletMethods.length > 0
        ) {
          next.eWalletMethods = data.eWalletMethods.map((m) => ({
            id: m.id,
            name: m.name,
            enabled: !!m.enabled,
            feePercent: typeof m.feePercent === "number" ? m.feePercent : 0,
          }));
        }
        if (data.codEnabled !== undefined) next.codEnabled = data.codEnabled;
        if (data.codMinOrder !== undefined) next.codMinOrder = data.codMinOrder;
        if (data.codMaxOrder !== undefined) next.codMaxOrder = data.codMaxOrder;
        if (data.codFee !== undefined) next.codFee = data.codFee;
        if (data.virtualAccountEnabled !== undefined)
          next.virtualAccountEnabled = data.virtualAccountEnabled;
        if (data.virtualAccountFee !== undefined)
          next.virtualAccountFee = data.virtualAccountFee;
        if (data.midtransServerKey !== undefined)
          next.midtransServerKey = data.midtransServerKey;
        if (data.midtransClientKey !== undefined)
          next.midtransClientKey = data.midtransClientKey;
        if (data.midtransIsProduction !== undefined)
          next.midtransIsProduction = data.midtransIsProduction;
        if (data.paymentTimeout !== undefined)
          next.paymentTimeout = data.paymentTimeout;
        if (data.autoApprovePayment !== undefined)
          next.autoApprovePayment = data.autoApprovePayment;
        if (data.requirePaymentProof !== undefined)
          next.requirePaymentProof = data.requirePaymentProof;
        if (data.paymentProofRequired !== undefined)
          next.paymentProofRequired = data.paymentProofRequired;
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    if (isApiConfigured() && getAdminToken()) {
      setLoading(true);
      paymentGetSettings(getAdminToken())
        .then((data) => {
          mergeSettingsFromApi(data);
        })
        .catch(() => {
          try {
            const stored = localStorage.getItem("admin_payment_settings");
            if (stored) {
              const parsed = JSON.parse(stored);
              mergeSettingsFromApi(parsed);
            }
          } catch {
            // ignore
          }
        })
        .finally(() => setLoading(false));
      return;
    }
    try {
      const storedSettings = localStorage.getItem("admin_payment_settings");
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings((prev) => {
          const next = { ...prev, ...parsed };
          if (
            !next.eWalletMethods ||
            !Array.isArray(next.eWalletMethods) ||
            next.eWalletMethods.length === 0
          ) {
            next.eWalletMethods = DEFAULT_EWALLET_METHODS.map((m) => ({
              ...m,
            }));
          }
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to parse stored payment settings:", error);
    }
    setLoading(false);
  }, [mergeSettingsFromApi]);

  const buildPayload = useCallback((s: PaymentSettings) => {
    const num = (v: number, fallback: number) =>
      typeof v === "number" && !Number.isNaN(v) ? v : fallback;
    return {
      eWalletEnabled: !!s.eWalletEnabled,
      eWalletMethods: s.eWalletMethods.map((m) => ({
        id: m.id,
        name: m.name,
        enabled: !!m.enabled,
        feePercent: num(m.feePercent, 0),
      })),
      codEnabled: !!s.codEnabled,
      codMinOrder: num(s.codMinOrder, 50000),
      codMaxOrder: num(s.codMaxOrder, 5000000),
      codFee: num(s.codFee, 0),
      virtualAccountEnabled: !!s.virtualAccountEnabled,
      virtualAccountFee: num(s.virtualAccountFee, 4000),
      midtransServerKey: String(s.midtransServerKey ?? ""),
      midtransClientKey: String(s.midtransClientKey ?? ""),
      midtransIsProduction: !!s.midtransIsProduction,
      paymentTimeout: num(s.paymentTimeout, 24),
      autoApprovePayment: !!s.autoApprovePayment,
      requirePaymentProof: !!s.requirePaymentProof,
      paymentProofRequired: !!s.paymentProofRequired,
    };
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const saveToApi = useCallback(async (s: PaymentSettings) => {
    const token = getAdminToken();
    if (!token) throw new Error("Token diperlukan");
    const payload = buildPayload(s);
    const updated = await paymentUpdateSettings(token, payload);
    return updated;
  }, [buildPayload]);

  const handleSave = async () => {
    setMessage(null);
    if (isApiConfigured() && getAdminToken()) {
      setSaving(true);
      try {
        const updated = await saveToApi(settings);
        mergeSettingsFromApi(updated);
        setMessage({
          type: "success",
          text: "Pengaturan pembayaran berhasil disimpan!",
        });
        setTimeout(() => setMessage(null), 3000);
      } catch (e) {
        setMessage({
          type: "error",
          text:
            e instanceof Error
              ? e.message
              : "Gagal menyimpan pengaturan pembayaran.",
        });
      } finally {
        setSaving(false);
      }
      return;
    }
    try {
      localStorage.setItem("admin_payment_settings", JSON.stringify(settings));
      setMessage({
        type: "success",
        text: "Pengaturan pembayaran berhasil disimpan!",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({
        type: "error",
        text: "Gagal menyimpan ke penyimpanan lokal.",
      });
    }
  };

  const updateEWalletMethod = (
    id: string,
    patch: Partial<Pick<EWalletMethod, "enabled" | "feePercent">>,
  ) => {
    setSettings((prev) => ({
      ...prev,
      eWalletMethods: prev.eWalletMethods.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    }));
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Pembayaran</h1>
        <p className="text-muted-foreground">
          Kelola metode pembayaran dan konfigurasinya
        </p>
      </div>

      {message && (
        <Alert
          className={
            message.type === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          {message.type === "success" ? (
            <AlertCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription
            className={
              message.type === "success" ? "text-green-800" : "text-red-800"
            }
          >
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

      {/* E-Wallet Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            E-Wallet
          </CardTitle>
          <CardDescription>
            Pilih metode e-wallet dan atur biaya tambahan (% per transaksi)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aktifkan E-Wallet</Label>
              <p className="text-sm text-muted-foreground">
                Izinkan pelanggan untuk melakukan pembayaran via e-wallet
              </p>
            </div>
            <Switch
              checked={settings.eWalletEnabled}
              onCheckedChange={(checked) =>
                handleChange("eWalletEnabled", checked)
              }
            />
          </div>

          {settings.eWalletEnabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label>Metode & Biaya</Label>
                <p className="text-sm text-muted-foreground">
                  Aktifkan tiap metode dan isi fee dalam persen (contoh: 2 untuk
                  2%/transaksi)
                </p>
                <div className="space-y-3">
                  {settings.eWalletMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex flex-wrap items-center gap-4 rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <Switch
                          checked={method.enabled}
                          onCheckedChange={(checked) =>
                            updateEWalletMethod(method.id, { enabled: checked })
                          }
                        />
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          min={0}
                          max={100}
                          className="w-24"
                          value={method.feePercent}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const v = raw === "" ? 0 : parseFloat(raw);
                            if (!Number.isNaN(v) && v >= 0)
                              updateEWalletMethod(method.id, { feePercent: v });
                          }}
                        />
                        <span className="text-sm text-muted-foreground">
                          %/transaksi
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* COD Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            COD (Cash on Delivery)
          </CardTitle>
          <CardDescription>Konfigurasi metode pembayaran COD</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aktifkan COD</Label>
              <p className="text-sm text-muted-foreground">
                Izinkan pelanggan untuk melakukan pembayaran saat barang
                diterima
              </p>
            </div>
            <Switch
              checked={settings.codEnabled}
              onCheckedChange={(checked) => handleChange("codEnabled", checked)}
            />
          </div>

          {settings.codEnabled && (
            <>
              <Separator />
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codMinOrder">Minimal Pesanan (Rp)</Label>
                  <Input
                    id="codMinOrder"
                    type="number"
                    value={settings.codMinOrder}
                    onChange={(e) =>
                      handleChange("codMinOrder", parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimal nilai pesanan untuk COD
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codMaxOrder">Maksimal Pesanan (Rp)</Label>
                  <Input
                    id="codMaxOrder"
                    type="number"
                    value={settings.codMaxOrder}
                    onChange={(e) =>
                      handleChange("codMaxOrder", parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimal nilai pesanan untuk COD
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codFee">Biaya COD (Rp)</Label>
                  <Input
                    id="codFee"
                    type="number"
                    value={settings.codFee}
                    onChange={(e) =>
                      handleChange("codFee", parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Biaya tambahan untuk COD (0 untuk gratis)
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Virtual Account Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Virtual Account
          </CardTitle>
          <CardDescription>
            Aktifkan atau nonaktifkan metode pembayaran virtual account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aktifkan Virtual Account</Label>
              <p className="text-sm text-muted-foreground">
                Izinkan pelanggan untuk melakukan pembayaran via virtual account
              </p>
            </div>
            <Switch
              checked={settings.virtualAccountEnabled}
              onCheckedChange={(checked) =>
                handleChange("virtualAccountEnabled", checked)
              }
            />
          </div>

          {settings.virtualAccountEnabled && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="virtualAccountFee">Biaya (Rp/transaksi)</Label>
                <Input
                  id="virtualAccountFee"
                  type="number"
                  min={0}
                  value={settings.virtualAccountFee}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!Number.isNaN(v) && v >= 0)
                      handleChange("virtualAccountFee", v);
                  }}
                  placeholder="4000"
                />
                <p className="text-xs text-muted-foreground">
                  Biaya tambahan per transaksi virtual account (default Rp
                  4.000)
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Kredensial Midtrans */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Kredensial Midtrans
          </CardTitle>
          <CardDescription>
            Masukkan Server Key dan Client Key dari dashboard Midtrans.
            Digunakan untuk VA, e-wallet, dll.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="midtransServerKey">Server Key</Label>
            <Input
              id="midtransServerKey"
              type="password"
              autoComplete="off"
              value={settings.midtransServerKey}
              onChange={(e) =>
                handleChange("midtransServerKey", e.target.value)
              }
              placeholder="SB-Mid-server-xxxx atau Mid-server-xxxx"
            />
            <p className="text-xs text-muted-foreground">
              Untuk transaksi dari server (jangan dibagikan ke frontend)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="midtransClientKey">Client Key</Label>
            <Input
              id="midtransClientKey"
              type="password"
              autoComplete="off"
              value={settings.midtransClientKey}
              onChange={(e) =>
                handleChange("midtransClientKey", e.target.value)
              }
              placeholder="SB-Mid-client-xxxx atau Mid-client-xxxx"
            />
            <p className="text-xs text-muted-foreground">
              Untuk inisialisasi pembayaran di frontend (Snap/Core)
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode Produksi</Label>
              <p className="text-sm text-muted-foreground">
                Nyala = pakai kredensial produksi, mati = sandbox (testing)
              </p>
            </div>
            <Switch
              checked={settings.midtransIsProduction}
              onCheckedChange={(checked) =>
                handleChange("midtransIsProduction", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* General Payment Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Pengaturan Umum Pembayaran
          </CardTitle>
          <CardDescription>
            Konfigurasi umum untuk semua metode pembayaran
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentTimeout">
              Batas Waktu Pembayaran (menit)
            </Label>
            <Input
              id="paymentTimeout"
              type="number"
              value={settings.paymentTimeout}
              onChange={(e) =>
                handleChange("paymentTimeout", parseInt(e.target.value))
              }
            />
            <p className="text-xs text-muted-foreground">
              Waktu maksimal untuk menyelesaikan pembayaran setelah pesanan
              dibuat
            </p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Approve Pembayaran</Label>
              <p className="text-sm text-muted-foreground">
                Otomatis menyetujui pembayaran tanpa verifikasi manual
              </p>
            </div>
            <Switch
              checked={settings.autoApprovePayment}
              onCheckedChange={(checked) =>
                handleChange("autoApprovePayment", checked)
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Wajib Upload Bukti Pembayaran</Label>
              <p className="text-sm text-muted-foreground">
                Pelanggan harus mengupload bukti pembayaran untuk metode
                tertentu
              </p>
            </div>
            <Switch
              checked={settings.requirePaymentProof}
              onCheckedChange={(checked) =>
                handleChange("requirePaymentProof", checked)
              }
            />
          </div>
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
  );
}
