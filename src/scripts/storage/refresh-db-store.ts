import { DataStore, ServerData, setDb } from '/scripts/storage/db-store'
import { getHosts } from '/scripts/utils/hosts'
import { log } from '/scripts/utils/log'

export async function main(ns: NS): Promise<void> {
  log(ns, 'Refreshing db.txt', 'INFO', false)
  try {
    await refreshDb(ns)
  } catch (e) {
    log(ns, 'Error refreshing db.txt', 'ERROR')
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
  const hostData = hosts.map(
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
      securityLevel: ns.getServerBaseSecurityLevel(host),
    }),
  ) as ServerData[]
  return {
    updatedOn,
    hosts: hostData,
    purchasedHostnames: purchasedHosts,
  } as DataStore
}
