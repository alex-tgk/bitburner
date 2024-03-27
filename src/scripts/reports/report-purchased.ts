import { NS } from '@ns'
import { createTable } from '/scripts/utils/reporter'

export async function main(ns: NS): Promise<void> {
  const headers = ['Host', 'Used Memory', 'Total Memory', '# Cores']
  const rows = ['home', ...ns.getPurchasedServers()].map((host) => {
    return [
      host,
      ns.formatRam(ns.getServerUsedRam(host), 0),
      ns.formatRam(ns.getServerMaxRam(host), 0),
      ns.formatNumber(ns.getServer(host).cpuCores, 0),
    ]
  })
  const tableData = [headers, ...rows]
  const table = createTable(tableData)
  ns.tprint(`\n${table}`)
}
