import { NS, ProcessInfo } from '@ns'
import { getHosts } from '/scripts/utils/hosts'
import { createTable } from '/scripts/utils/reporter'

type RunningScript = { host: string } & ProcessInfo

export async function main(ns: NS): Promise<void> {
  const hosts = getHosts(ns, true)
  const runningScripts = hosts.flatMap((host) => ({
    host,
    ...ns.ps(host),
  })) as RunningScript[]
  const headers = ['Host', 'Script', 'Threads', 'Args']
  const rows = runningScripts.map(({ host, filename, threads, args }) => [
    host,
    filename,
    threads,
    args?.length > 0 ? args.join(', ') : '',
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
