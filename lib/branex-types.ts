// BRANEX Data Types

export interface Holding {
  id: string
  name: string
  symbol: string
  sector: string
  sectorColor: string
  quantity: number
  avgCost: number
  currentPrice: number
  entryDate: string
  notes?: string
}

export interface Transaction {
  id: string
  date: string
  type: 'COMPRA' | 'VENTA' | 'DIVIDENDO' | 'SPLIT'
  assetName: string
  symbol: string
  shares: number
  pricePerShare: number
  total: number
  notes?: string
}

export interface UserProfile {
  name: string
  company: string
  currency: string
  portfolioStartDate: string
  initialCapital: number
  benchmark: 'SP500' | 'NASDAQ' | 'CUSTOM'
  finnhubApiKey?: string
}

export interface PortfolioSnapshot {
  date: string
  value: number
  invested: number
}

// Watchlist item
export interface WatchlistItem {
  id: string
  symbol: string
  name: string
  sector: string
  price: number
  change: number
  volume: string
  marketCap: string
  alert: boolean
  targetPrice?: number
  notes?: string
  addedAt: string
}

// Single portfolio data structure
export interface Portfolio {
  id: string
  name: string
  createdAt: string
  holdings: Holding[]
  transactions: Transaction[]
  snapshots: PortfolioSnapshot[]
  watchlist: WatchlistItem[]
  profile: UserProfile
}

// Multi-portfolio storage structure
export interface BranexStorage {
  activePortfolioId: string | null
  portfolios: Portfolio[]
}

// Legacy single portfolio data (for backwards compatibility)
export interface BranexData {
  holdings: Holding[]
  transactions: Transaction[]
  profile: UserProfile
  snapshots: PortfolioSnapshot[]
}

// Calculated metrics
export interface PortfolioMetrics {
  totalValue: number
  totalInvested: number
  totalPnL: number
  totalReturnPercent: number
  activePositions: number
  diversificationScore: number // 0-100 based on HHI (Herfindahl-Hirschman Index)
  sectorAllocation: { name: string; value: number; color: string }[]
}

// Holding with calculated fields
export interface HoldingWithMetrics extends Holding {
  marketValue: number
  totalPnL: number
  pnlPercent: number
  weight: number
}
