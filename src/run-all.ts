import { calculateThreads } from '/lib/script-utils'
import { getHosts } from '/scripts/utils/hosts'

/**
 * Runs a specified script on all servers.
 * Passes hostname as a target to the script.
 *
 * @param ns - The NetScriptJS object.
 * @returns A Promise that resolves when all scripts have been executed.
 */
export async function main(ns: NS): Promise<void> {
  const hosts = getHosts(ns, true)
  const targetScript = ns.args[0] as string
  if (!ns.fileExists(targetScript)) {
    ns.tprint(`The script ${targetScript} does not exist`)
    return
  }
  const successfulHosts: {
    host: string
    threads: number
  }[] = []
  const failedHosts: string[] = []
  for (const host of hosts) {
    await ns.scp(targetScript, host)
    const threads = calculateThreads(ns, host, targetScript)
    if (threads === 0) {
      ns.tprint(`Not enough RAM to run ${targetScript} on ${host}`)
      failedHosts.push(host)
      continue
    }
    successfulHosts.push({
      host,
      threads,
    })
    await ns.exec(targetScript, host, threads, host)
  }
  //print table of successful and failed hosts
  if (successfulHosts.length > 0) {
    ns.tprint(`Successfully ran ${targetScript} on:`)
    ns.tprintf(`$## Host\t\tThreads`)
    ns.tprint(`## ---\t\t---`)
    for (const host of successfulHosts) {
      ns.tprintf(`## %s\t\t%d threads`, host.host.padEnd(20), host.threads)
    }
  }
  if (failedHosts.length > 0) {
    ns.tprint(`## Failed to run ${targetScript} on:`)
    for (const host of failedHosts) {
      ns.tprint(`## ${host}`)
    }
  }
}
