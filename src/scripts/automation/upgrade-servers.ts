/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
  const ramOptions = [
    8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
  ] // RAM options for servers, in GB
  const minimumBalanceRatio = 0.05 // Keep at least 5% of your total money

  while (true) {
    const currentFunds = ns.getServerMoneyAvailable('home')
    const minimumBalance = currentFunds * minimumBalanceRatio
    const servers = ns.getPurchasedServers().map((server) => ({
      hostname: server,
      ram: ns.getServerMaxRam(server),
    }))

    // Sort servers by RAM to prioritize upgrading the lowest RAM server first
    servers.sort((a, b) => a.ram - b.ram)

    for (const server of servers) {
      const currentRamIndex = ramOptions.indexOf(server.ram)
      if (currentRamIndex < 0) {
        ns.tprint(`Error: Server RAM ${server.ram}GB not found in options.`)
        continue
      }
      const nextRamIndex = currentRamIndex + 1

      // Check if there's a higher RAM option available
      if (nextRamIndex < ramOptions.length) {
        const nextRam = ramOptions[nextRamIndex]
        const upgradeCost = ns.getPurchasedServerCost(nextRam)

        if (currentFunds - upgradeCost > minimumBalance) {
          // Perform the upgrade
          ns.killall(server.hostname) // Kill all scripts running on the server
          ns.deleteServer(server.hostname) // Delete the old server
          const newHostname = ns.purchaseServer(`pserv-${nextRam}`, nextRam) // Purchase new server with higher RAM
          ns.tprint(
            `Upgraded server ${server.hostname} to ${newHostname} with ${nextRam}GB RAM.`,
          )
          break // Break the loop to ensure we only upgrade one server at a time
        }
      }
    }

    await ns.sleep(2500)
  }
}
