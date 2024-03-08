export const getHosts = (ns: NS, includePlayerOwned = false): string[] => {
  const scannedHosts = scanServers(ns)
  const purchasedHosts = ns.getPurchasedServers()
  return [
    ...scannedHosts,
    ...(includePlayerOwned ? purchasedHosts : []),
    ...(includePlayerOwned ? ['home'] : []),
  ]
}

const scanServers = (
  ns: NS,
  start = 'home',
  visited = new Set<string>(),
): string[] => {
  visited.add(start)
  const neighbors = ns.scan(start).filter((server) => !visited.has(server))
  for (const neighbor of neighbors) {
    scanServers(ns, neighbor, visited)
  }
  return Array.from(visited)
}
