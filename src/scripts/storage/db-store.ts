import { log } from '/scripts/utils/log'
import { getPortData, Port, writePort } from '/scripts/utils/ports'

export interface ServerData {
  name: string
  isPurchased: boolean
  isBeingHacked: boolean
  isBeingGrown: boolean
  isBeingWeakened: boolean
  maxRam: number
  maxMoney: number
  usedRam: number
  freeRam: number
  playerOwned: boolean
  moneyAvailable: number
  hasRootAccess: boolean
  hackingLevel: number
  securityLevel: number
}

export interface DataStore {
  readonly updatedOn: Date
  hosts: ServerData[]
  purchasedHostnames: string[]
}

export const setDb = async (
  ns: NS,
  data: DataStore | ((prev: DataStore) => DataStore),
): Promise<DataStore> => {
  const dataStore: DataStore =
    typeof data === 'function' ? data({ ...(await getDb(ns)) }) : data
  writePort(ns, Port.db, dataStore, true)
  writeDbToFile(ns, dataStore)
  return dataStore
}

const writeDbToFile = (ns: NS, data: DataStore) => {
  try {
    ns.write('db.txt', JSON.stringify(data), 'w')
  } catch (e) {
    log(ns, 'Error writing db.txt', 'ERROR')
    if (e instanceof Error) {
      log(ns, e, 'ERROR')
    }
  }
}

export const getDb = async (ns: NS): Promise<DataStore> => {
  const fromPort = await getDbFromPort(ns)
  if (fromPort) {
    return fromPort
  }
  const fromFile = await getDbFromFile(ns)
  if (fromFile) {
    return fromFile
  }
  log(ns, 'No db found, creating new db...', 'INFO', true)
  return waitForDbRefresh(ns)
}

const waitForDbRefresh = async (ns: NS): Promise<DataStore> => {
  log(ns, 'Triggering db refresh...', 'INFO', false)
  ns.exec('/scripts/storage/refresh-db-store.js', 'home')
  await ns.nextPortWrite(Port.db)

  return getDb(ns)
}

const getDbFromPort = async (ns: NS): Promise<void | DataStore> => {
  const db = getPortData<DataStore>(ns, Port.db)
  if (!db) {
    return
  }
  return db
}

const getDbFromFile = async (ns: NS): Promise<void | DataStore> => {
  const hasFileStore = ns.fileExists('db.txt')
  if (!hasFileStore) {
    log(ns, 'No db.txt file found.', 'INFO')
    return
  }
  try {
    // Try to read it from the file system
    const data = ns.read('db.txt')
    const parsed = JSON.parse(data)
    return parsed
  } catch (e) {
    log(ns, 'Error reading db.txt', 'ERROR')
    if (e instanceof Error) {
      log(ns, e, 'ERROR')
    }
  }
}
