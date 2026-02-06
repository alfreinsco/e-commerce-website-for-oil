'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface WishlistItem {
  id: number
  name: string
  price: number
  description?: string
  category?: string
  rating?: number
  reviews?: number
  image?: string
  syncedToBackend?: boolean
  syncedAt?: string
}

interface WishlistContextType {
  wishlistItems: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (productId: number) => void
  isInWishlist: (productId: number) => boolean
  toggleWishlist: (item: WishlistItem) => void
  markAsSynced: (productId: number) => void
  markAsUnsynced: (productId: number) => void
  getUnsyncedItems: () => WishlistItem[]
  getTotalItems: () => number
  isLoading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem('wishlist')
    if (storedWishlist) {
      try {
        setWishlistItems(JSON.parse(storedWishlist))
      } catch (error) {
        console.error('Failed to parse stored wishlist:', error)
        localStorage.removeItem('wishlist')
      }
    }
    setIsLoading(false)
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems))
    }
  }, [wishlistItems, isLoading])

  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems((prevItems) => {
      // Check if item already exists
      if (prevItems.some((i) => i.id === item.id)) {
        return prevItems
      }
      // Add item (not synced yet)
      return [...prevItems, { ...item, syncedToBackend: false, syncedAt: undefined }]
    })
  }

  const removeFromWishlist = (productId: number) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item) => item.id === productId)
  }

  const toggleWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id)
    } else {
      addToWishlist(item)
    }
  }

  const markAsSynced = (productId: number) => {
    setWishlistItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, syncedToBackend: true, syncedAt: new Date().toISOString() }
          : item
      )
    )
  }

  const markAsUnsynced = (productId: number) => {
    setWishlistItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, syncedToBackend: false, syncedAt: undefined }
          : item
      )
    )
  }

  const getUnsyncedItems = () => {
    return wishlistItems.filter((item) => !item.syncedToBackend)
  }

  const getTotalItems = () => {
    return wishlistItems.length
  }

  const value: WishlistContextType = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    markAsSynced,
    markAsUnsynced,
    getUnsyncedItems,
    getTotalItems,
    isLoading,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
