/**
 * Discovers all unique hosts in a network starting from a given host.
 * Writes the discovered hosts to a file.
 * @param ns - The namespace object.
 * @returns A promise that resolves when the discovery process is complete.
 */
export async function main(ns: NS): Promise<void> {
  const allHosts = getAllServers(ns)
  // Write the discovered hosts to a file
  const filename = "hosts.txt"
  // Ensure the file is empty before writing
  await ns.write(filename, "", "w")
  for (const host of allHosts) {
    await ns.write(filename, host + "\n", "a") // Append each host to the file
  }

  ns.tprint(
    `Discovery complete. Found ${allHosts.length} hosts. Results saved to ${filename}`,
  )
}

function getAllServers(ns: NS, start = "home", visited = [] as string[]) {
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
