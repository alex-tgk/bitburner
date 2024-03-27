import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
  const symbols = ns.stock.getSymbols()

  for (const symbol of symbols) {
    const actions = getStockActions(ns, symbol)
    if (actions) {
      actions()
    }
  }
}

const getStockActions = (ns: NS, symbol: string): void | (() => void) => {
  const { stock: market } = ns
  const position = market.getForecast(symbol)
  const bullish = position >= 0.5
  if (bullish) {
    return () => {
      const funds = ns.getServerMoneyAvailable('home')
      const shares = Math.min(
        Math.floor(funds / market.getPrice(symbol)),
        market.getMaxShares(symbol),
      )
      market.buyStock(symbol, shares)
    }
  }
}
