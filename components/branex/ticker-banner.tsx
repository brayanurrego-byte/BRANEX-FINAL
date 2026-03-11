"use client"

import { cn } from '@/lib/utils'

const tickerItems = [
  { symbol: 'AAPL', change: 1.2, price: 189.45 },
  { symbol: 'MSFT', change: 0.8, price: 415.32 },
  { symbol: 'NVDA', change: 3.1, price: 875.40 },
  { symbol: 'SPY', change: 0.5, price: 522.18 },
  { symbol: 'QQQ', change: 1.1, price: 445.67 },
  { symbol: 'BTC', change: 2.3, price: 67420 },
  { symbol: 'ORO', change: -0.2, price: 2145 },
  { symbol: 'EUR/USD', change: 0.1, price: 1.0842 },
  { symbol: 'AMZN', change: 2.0, price: 185.20 },
  { symbol: 'GOOGL', change: 1.8, price: 172.63 },
  { symbol: 'TSLA', change: -1.5, price: 245.78 },
  { symbol: 'META', change: 2.5, price: 512.33 },
  { symbol: 'JPM', change: 1.5, price: 198.45 },
  { symbol: 'V', change: 1.1, price: 278.50 },
  { symbol: 'JNJ', change: -0.3, price: 158.34 },
]

export function TickerBanner() {
  return (
    <div className="w-full h-10 bg-[#080820]/90 border-b border-[rgba(0,163,255,0.15)] overflow-hidden">
      <div className="flex animate-ticker whitespace-nowrap h-full items-center">
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-6 h-full border-r border-[rgba(0,163,255,0.1)]"
          >
            <span className="font-mono text-sm font-medium text-white">{item.symbol}</span>
            <span className="font-mono text-sm text-[#8892b0]">
              ${item.price.toLocaleString()}
            </span>
            <span className={cn(
              "font-mono text-sm font-medium",
              item.change > 0 ? "text-[#00FF88]" : "text-[#FF3366]"
            )}>
              {item.change > 0 ? '+' : ''}{item.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
