"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface CryptoData {
  name: string
  symbol: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
}

interface CryptoChartProps {
  data: CryptoData
}

export default function CryptoChart({ data }: CryptoChartProps) {
  const isPositive = data.change24h >= 0

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{data.name}</h3>
          <p className="text-sm text-muted-foreground">{data.symbol.toUpperCase()}</p>
        </div>
        <div className={`flex items-center gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="font-semibold">
            {isPositive ? "+" : ""}
            {data.change24h.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Price</span>
          <span className="font-semibold text-lg">{formatNumber(data.price)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Market Cap</span>
          <span className="font-medium">{formatNumber(data.marketCap)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">24h Volume</span>
          <span className="font-medium">{formatNumber(data.volume24h)}</span>
        </div>
      </div>

      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all ${
            isPositive ? "bg-green-500" : "bg-red-500"
          }`}
          style={{ width: `${Math.min(Math.abs(data.change24h) * 10, 100)}%` }}
        />
      </div>
    </Card>
  )
}
