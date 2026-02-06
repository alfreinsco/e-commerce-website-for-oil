"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Leaf,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Cloud,
  CloudOff,
  MapPin,
  CreditCard,
  CheckCircle2,
  Ticket,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/app/context/cart-context";
import { useAuth } from "@/app/context/auth-context";
import { Badge } from "@/components/ui/badge";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  detailAddress: string;
  postalCode: string;
  isActive: boolean;
}

const paymentMethods = [
  {
    value: "bank_transfer",
    label: "Transfer Bank",
    description: "BCA, Mandiri, BRI, BNI",
  },
  {
    value: "e_wallet",
    label: "E-Wallet",
    description: "OVO, GoPay, DANA, LinkAja",
  },
  {
    value: "cod",
    label: "COD (Cash on Delivery)",
    description: "Bayar saat barang diterima",
  },
  {
    value: "virtual_account",
    label: "Virtual Account",
    description: "Pembayaran via Virtual Account",
  },
];

// Tipe voucher yang dipakai di keranjang (dari admin_vouchers)
type CartVoucher = {
  code: string;
  discount: number;
  type: "percentage" | "fixed" | "free_shipping";
  minPurchase: number;
};

const DEFAULT_VOUCHERS: CartVoucher[] = [
  { code: "DISKON10", discount: 10, type: "percentage", minPurchase: 50000 },
  { code: "DISKON20", discount: 20, type: "percentage", minPurchase: 100000 },
  { code: "FREESHIP", discount: 0, type: "free_shipping", minPurchase: 0 },
  { code: "CASHBACK50K", discount: 50000, type: "fixed", minPurchase: 200000 },
];

// Shipping cost based on province (simulasi)
const getShippingCost = (
  province: string,
  regency: string,
  subtotal: number,
): number => {
  // Free shipping for orders above 100k
  if (subtotal >= 100000) {
    return 0;
  }

  // Base shipping cost by province zone
  const provinceLower = province.toLowerCase();

  // Zone 1: Jawa, Bali (15k-20k)
  if (provinceLower.includes("jawa") || provinceLower.includes("bali")) {
    return 15000;
  }

  // Zone 2: Sumatera, Kalimantan (25k-30k)
  if (
    provinceLower.includes("sumatera") ||
    provinceLower.includes("sumatra") ||
    provinceLower.includes("kalimantan") ||
    provinceLower.includes("riau") ||
    provinceLower.includes("lampung") ||
    provinceLower.includes("bengkulu")
  ) {
    return 25000;
  }

  // Zone 3: Sulawesi, Maluku, Papua (35k-40k)
  if (
    provinceLower.includes("sulawesi") ||
    provinceLower.includes("maluku") ||
    provinceLower.includes("papua") ||
    provinceLower.includes("gorontalo")
  ) {
    return 35000;
  }

  // Default: 20k
  return 20000;
};

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getUnsyncedItems,
    isLoading,
  } = useCart();
  const { user } = useAuth();
  const unsyncedCount = getUnsyncedItems().length;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [notes, setNotes] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<CartVoucher | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [vouchersList, setVouchersList] = useState<CartVoucher[]>(DEFAULT_VOUCHERS);

  // Load addresses from localStorage
  useEffect(() => {
    const storedAddresses = localStorage.getItem("user_addresses");
    if (storedAddresses) {
      try {
        const parsed = JSON.parse(storedAddresses);
        setAddresses(parsed);
        // Set active address as default
        const activeAddress = parsed.find((addr: Address) => addr.isActive);
        if (activeAddress) {
          setSelectedAddressId(activeAddress.id);
        } else if (parsed.length > 0) {
          setSelectedAddressId(parsed[0].id);
        }
      } catch (error) {
        console.error("Failed to parse stored addresses:", error);
      }
    }
  }, []);

  // Load vouchers dari pengaturan admin (localStorage admin_vouchers)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin_vouchers");
      if (!raw) return;
      const parsed: Array<{
        code: string;
        type: string;
        discount: number;
        minPurchase: number;
        isActive?: boolean;
        validFrom?: string;
        validTo?: string;
        usageLimit?: number;
        usedCount?: number;
      }> = JSON.parse(raw);
      const now = new Date().toISOString().slice(0, 10);
      const forCart: CartVoucher[] = parsed
        .filter(
          (v) =>
            v.isActive !== false &&
            (!v.validFrom || v.validFrom <= now) &&
            (!v.validTo || v.validTo >= now) &&
            (v.usageLimit == null || v.usageLimit <= 0 || (v.usedCount ?? 0) < v.usageLimit)
        )
        .map((v) => ({
          code: v.code,
          type: v.type as CartVoucher["type"],
          discount: v.discount,
          minPurchase: v.minPurchase ?? 0,
        }));
      if (forCart.length > 0) setVouchersList(forCart);
    } catch {
      // tetap pakai DEFAULT_VOUCHERS
    }
  }, []);

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: number) => {
    removeFromCart(id);
  };

  const subtotal = getTotalPrice();
  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId,
  );

  // Calculate shipping cost based on address
  const baseShippingCost = selectedAddress
    ? getShippingCost(
        selectedAddress.province,
        selectedAddress.regency,
        subtotal,
      )
    : 0;

  // Calculate voucher discount
  let voucherDiscount = 0;
  let finalShippingCost = baseShippingCost;

  if (appliedVoucher) {
    if (appliedVoucher.type === "free_shipping") {
      finalShippingCost = 0;
    } else if (appliedVoucher.type === "percentage") {
      voucherDiscount = (subtotal * appliedVoucher.discount) / 100;
    } else if (appliedVoucher.type === "fixed") {
      voucherDiscount = appliedVoucher.discount;
    }
  }

  // Calculate tax (PPN 11% di Indonesia)
  const taxRate = 0.11;
  const tax = (subtotal - voucherDiscount) * taxRate;

  // Calculate total
  const total = subtotal - voucherDiscount + finalShippingCost + tax;

  const handleApplyVoucher = () => {
    setVoucherError("");
    if (!voucherCode.trim()) {
      setVoucherError("Masukkan kode voucher");
      return;
    }

    const voucher = vouchersList.find(
      (v) => v.code.toUpperCase() === voucherCode.toUpperCase().trim(),
    );

    if (!voucher) {
      setVoucherError("Kode voucher tidak valid");
      return;
    }

    if (subtotal < voucher.minPurchase) {
      setVoucherError(
        `Minimal pembelian Rp ${voucher.minPurchase.toLocaleString("id-ID")}`,
      );
      return;
    }

    setAppliedVoucher(voucher);
    setVoucherCode("");
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
  };

  const handleCheckout = () => {
    if (!selectedAddress || !selectedPaymentMethod) {
      return;
    }

    const checkoutData = {
      customer: {
        name: user?.fullName,
        email: user?.email,
        phone: user?.phone,
      },
      address: selectedAddress,
      paymentMethod: selectedPaymentMethod,
      notes: notes,
      voucher: appliedVoucher,
      voucherCode: appliedVoucher?.code,
      cartItems: cartItems,
      subtotal: subtotal,
      voucherDiscount: voucherDiscount,
      shippingCost: finalShippingCost,
      tax: tax,
      total: total,
    };

    console.log("Checkout:", checkoutData);
    // TODO: Implement checkout logic
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Memuat keranjang...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Keranjang Belanja</h1>
            {unsyncedCount > 0 && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                <CloudOff className="w-3 h-3 mr-1" />
                {unsyncedCount} item belum tersimpan
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Lengkapi pesanan Anda dan lakukan pembayaran
          </p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingBag className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Keranjang Kosong</h3>
              <p className="text-muted-foreground mb-6">
                Belum ada produk di keranjang Anda
              </p>
              <Link href="/shop">
                <Button>
                  <Leaf className="w-4 h-4 mr-2" />
                  Mulai Belanja
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Produk ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id}>
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                          <Leaf className="w-8 h-8 text-primary opacity-50" />
                          {/* Sync Status Badge */}
                          {item.syncedToBackend ? (
                            <Badge
                              variant="outline"
                              className="absolute top-1 right-1 bg-green-50 text-green-700 border-green-200 text-xs px-1.5 py-0"
                              title="Tersimpan ke backend"
                            >
                              <Cloud className="w-2.5 h-2.5 mr-0.5" />
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="absolute top-1 right-1 bg-yellow-50 text-yellow-700 border-yellow-200 text-xs px-1.5 py-0"
                              title="Belum tersimpan ke backend"
                            >
                              <CloudOff className="w-2.5 h-2.5 mr-0.5" />
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold line-clamp-2 flex-1">
                              {item.name}
                            </h3>
                          </div>
                          <p className="text-lg font-bold text-primary mt-1">
                            {formatPrice(item.price)}
                          </p>
                          {item.syncedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Tersimpan:{" "}
                              {new Date(item.syncedAt).toLocaleDateString(
                                "id-ID",
                              )}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity - 1,
                                  )
                                }
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity + 1,
                                  )
                                }
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                      {item.id !== cartItems[cartItems.length - 1].id && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pembeli</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama Lengkap</Label>
                      <div className="px-3 py-2 bg-muted rounded-md text-sm">
                        {user?.fullName || "-"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="px-3 py-2 bg-muted rounded-md text-sm">
                        {user?.email || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nomor Telepon</Label>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm">
                      {user?.phone || "-"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Alamat Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-lg">
                      <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">
                        Belum ada alamat pengiriman
                      </p>
                      <Link href="/profile">
                        <Button variant="outline" size="sm">
                          Tambah Alamat
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          Pilih Alamat Pengiriman *
                        </Label>
                        <Select
                          value={selectedAddressId}
                          onValueChange={setSelectedAddressId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih alamat pengiriman" />
                          </SelectTrigger>
                          <SelectContent>
                            {addresses.map((address) => (
                              <SelectItem key={address.id} value={address.id}>
                                <div className="flex items-center gap-2">
                                  <span>{address.label}</span>
                                  {address.isActive && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Aktif
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedAddress && (
                        <div className="border rounded-lg p-4 bg-muted/30">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">
                              {selectedAddress.label}
                            </h4>
                            {selectedAddress.isActive && (
                              <Badge className="bg-primary text-primary-foreground">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Aktif
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="font-medium">
                              {selectedAddress.recipientName}
                            </p>
                            <p className="text-muted-foreground">
                              {selectedAddress.phone}
                            </p>
                            <p className="text-muted-foreground">
                              {selectedAddress.detailAddress}
                            </p>
                            <p className="text-muted-foreground">
                              {selectedAddress.village},{" "}
                              {selectedAddress.district},{" "}
                              {selectedAddress.regency},{" "}
                              {selectedAddress.province}
                              {selectedAddress.postalCode &&
                                ` ${selectedAddress.postalCode}`}
                            </p>
                          </div>
                        </div>
                      )}

                      <Link href="/profile">
                        <Button variant="outline" size="sm" className="w-full">
                          <MapPin className="w-4 h-4 mr-2" />
                          Kelola Alamat
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Metode Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">
                      Pilih Metode Pembayaran *
                    </Label>
                    <Select
                      value={selectedPaymentMethod}
                      onValueChange={setSelectedPaymentMethod}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih metode pembayaran" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            <div>
                              <div className="font-medium">{method.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {method.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPaymentMethod && (
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <span className="font-semibold">
                          {
                            paymentMethods.find(
                              (m) => m.value === selectedPaymentMethod,
                            )?.label
                          }
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {
                          paymentMethods.find(
                            (m) => m.value === selectedPaymentMethod,
                          )?.description
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Voucher */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Kode Voucher
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appliedVoucher ? (
                    <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Ticket className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-700">
                              {appliedVoucher.code}
                            </span>
                            <Badge className="bg-green-600 text-white">
                              Aktif
                            </Badge>
                          </div>
                          <p className="text-sm text-green-600">
                            {appliedVoucher.type === "free_shipping" &&
                              "Gratis ongkos kirim"}
                            {appliedVoucher.type === "percentage" &&
                              `Diskon ${appliedVoucher.discount}%`}
                            {appliedVoucher.type === "fixed" &&
                              `Diskon Rp ${appliedVoucher.discount.toLocaleString("id-ID")}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveVoucher}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Masukkan kode voucher"
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value);
                          setVoucherError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleApplyVoucher();
                          }
                        }}
                      />
                      <Button
                        onClick={handleApplyVoucher}
                        disabled={!voucherCode.trim()}
                      >
                        Terapkan
                      </Button>
                    </div>
                  )}
                  {voucherError && (
                    <p className="text-sm text-destructive">{voucherError}</p>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Catatan Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Tambahkan catatan untuk pesanan Anda"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-14">
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    {appliedVoucher && voucherDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Diskon Voucher
                        </span>
                        <span className="font-medium text-green-600">
                          -{formatPrice(voucherDiscount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Ongkos Kirim
                      </span>
                      <span className="font-medium">
                        {finalShippingCost === 0 ? (
                          <span className="text-green-600">Gratis</span>
                        ) : (
                          formatPrice(finalShippingCost)
                        )}
                      </span>
                    </div>

                    {!selectedAddress && (
                      <p className="text-xs text-muted-foreground">
                        Pilih alamat untuk melihat ongkos kirim
                      </p>
                    )}

                    {selectedAddress &&
                      subtotal >= 100000 &&
                      finalShippingCost === 0 && (
                        <p className="text-xs text-green-600">
                          ✓ Gratis ongkir untuk pembelian di atas Rp 100.000
                        </p>
                      )}
                    {appliedVoucher?.type === "free_shipping" &&
                      finalShippingCost === 0 && (
                        <p className="text-xs text-green-600">
                          ✓ Gratis ongkir dari voucher {appliedVoucher.code}
                        </p>
                      )}

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Pajak (PPN 11%)
                      </span>
                      <span className="font-medium">{formatPrice(tax)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={!selectedAddress || !selectedPaymentMethod}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Lanjutkan Pembayaran
                  </Button>

                  {(!selectedAddress || !selectedPaymentMethod) && (
                    <p className="text-xs text-muted-foreground text-center">
                      {!selectedAddress &&
                        "Pilih alamat pengiriman terlebih dahulu"}
                      {selectedAddress &&
                        !selectedPaymentMethod &&
                        "Pilih metode pembayaran terlebih dahulu"}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    Dengan melanjutkan, Anda menyetujui syarat dan ketentuan
                    kami
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
