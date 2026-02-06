'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  description?: string
  category?: string
  image?: string
  syncedToBackend?: boolean
  syncedAt?: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  markAsSynced: (productId: number) => void
  markAsUnsynced: (productId: number) => void
  getUnsyncedItems: () => CartItem[]
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart))
      } catch (error) {
        console.error('Failed to parse stored cart:', error)
        localStorage.removeItem('cart')
      }
    }
    setIsLoading(false)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems, isLoading])

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)

      if (existingItem) {
        // If item already exists, update quantity and mark as unsynced if quantity changed
        const newQuantity = existingItem.quantity + (item.quantity || 1)
        return prevItems.map((i) =>
          i.id === item.id
            ? { 
                ...i, 
                quantity: newQuantity,
                syncedToBackend: false, // Mark as unsynced when quantity changes
                syncedAt: undefined
              }
            : i
        )
      } else {
        // If item doesn't exist, add it (not synced yet)
        return [...prevItems, { 
          ...item, 
          quantity: item.quantity || 1,
          syncedToBackend: false,
          syncedAt: undefined
        }]
      }
    })
  }

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId 
          ? { 
              ...item, 
              quantity,
              syncedToBackend: false, // Mark as unsynced when quantity changes
              syncedAt: undefined
            } 
          : item
      )
    )
  }

  const markAsSynced = (productId: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, syncedToBackend: true, syncedAt: new Date().toISOString() }
          : item
      )
    )
  }

  const markAsUnsynced = (productId: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, syncedToBackend: false, syncedAt: undefined }
          : item
      )
    )
  }

  const getUnsyncedItems = () => {
    return cartItems.filter((item) => !item.syncedToBackend)
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    markAsSynced,
    markAsUnsynced,
    getUnsyncedItems,
    isLoading,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
