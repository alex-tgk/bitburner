export async function main(ns: NS): Promise<void> {
  const hosts = getAllServers(ns)
  const stats = hosts.map((host) => ({
    host,
    money: ns.getServerMoneyAvailable(host),
    security: ns.getServerSecurityLevel(host),
  }))
}

function getAllServers(ns: NS, start = 'home', visited = [] as string[]) {
  visited.push(start)
  const neighbors = ns.scan(start).filter((server) => !visited.includes(server))
  for (const neighbor of neighbors) {
    visited.push(
      ...getAllServers(ns, neighbor, visited).filter(
        (server) => !visited.includes(server),
      ),
    )
  }
  return Array.from(visited)
}
