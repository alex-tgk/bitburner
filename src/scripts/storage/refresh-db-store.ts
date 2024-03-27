import { DataStore, ServerData, setDb } from '/scripts/storage/db-store'
import { getHosts } from '/scripts/utils/hosts'
import { log } from '/scripts/logger/logger'

export async function main(ns: NS): Promise<void> {
  log(ns, 'Refreshing db.txt', 'INFO', false)
  try {
    await refreshDb(ns)
  } catch (e) {
    log(ns, 'Error refreshing db.txt', 'ERROR', true)
    if (e instanceof Error) {
      log(ns, e, 'ERROR')
    }
  }
}

const refreshDb = async (ns: NS): Promise<void> => {
  const dataStore = await constructDataStore(ns)
  await setDb(ns, dataStore)
}

const constructDataStore = async (ns: NS): Promise<DataStore> => {
  const hosts = getHosts(ns, true)
  const updatedOn = new Date()
  const purchasedHosts = ns.getPurchasedServers()
  const hostData = hosts
    .filter((host) => host !== 'darkweb')
    .map(
      (host: string): ServerData => ({
        name: host,
        usedRam: ns.getServerUsedRam(host),
        isPurchased: purchasedHosts.includes(host),
        isBeingGrown: false,
        isBeingHacked: false,
        isBeingWeakened: false,
        maxMoney: ns.getServerMaxMoney(host),
        maxRam: ns.getServerMaxRam(host),
        freeRam: ns.getServerMaxRam(host) - ns.getServerUsedRam(host),
        playerOwned: host === 'home' || purchasedHosts.includes(host),
        moneyAvailable: Math.max(ns.getServerMoneyAvailable(host), 1),
        hasRootAccess: ns.hasRootAccess(host),
        hackingLevel: ns.getServerRequiredHackingLevel(host),
        securityLevel: ns.getServerSecurityLevel(host),
      }),
    ) as ServerData[]
  const playerOwnedMemory = hostData
    .filter((host) => host.playerOwned)
    .reduce((prev, host) => prev + host.freeRam, 0)
  return {
    updatedOn,
    hosts: hostData,
    purchasedHostnames: purchasedHosts,
    totals: {
      playerOwnedMemory,
    },
    staleCounter: 0,
  } as DataStore
}
