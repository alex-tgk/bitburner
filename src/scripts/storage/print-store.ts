import { NS } from '@ns'
import { getDb } from '/scripts/storage/db-store'
import { createTable } from '/scripts/utils/reporter'

export async function main(ns: NS): Promise<void> {
  const db = await getDb(ns)
  const headers = ['Server', 'Money %', 'Ram %', 'Max Ram', 'Used Ram']
  const rows = db.hosts
    .filter((host) => host.name !== 'home' && host.name !== 'darkweb')
    .filter((host) => !host.playerOwned)
    .map((host) => [
      host.name,
      `$${ns.formatNumber(host.moneyAvailable, 0)}`,
      host.usedRam === 0
        ? '0%'
        : `${Math.round((host.usedRam / host.maxRam) * 100)}%`,
      ns.formatNumber(host.maxRam, 0, undefined, true),
      ns.formatNumber(host.usedRam, 0),
    ])
  const tableData = [headers, ...rows]
  const withExtraHeaders = _.chain(tableData)
    .chunk(10)
    .reduce((acc, chunk) => {
      return [...acc, headers, ...chunk]
    })
    .value()
  const table = createTable(withExtraHeaders)
  ns.tprintf('\n')
  ns.tprint(table)
}
