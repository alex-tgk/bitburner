/**
 * Executes a script with most threads possible on a target server.
 *
 * @param ns - The namespace object.
 * @returns A promise that resolves when the script execution is complete.
 * @throws {Error} If no target script is provided or if the target script is empty.
 */
export async function main(ns: NS): Promise<void> {
  const targetScript = ns.args[0]
  const host = ns.getHostname()
  if (typeof targetScript !== 'string') {
    throw new Error('No target script provided')
  }
  if (targetScript.length === 0) {
    throw new Error('No target script provided')
  }
  const scriptRam = ns.getScriptRam(targetScript)
  const freeMemory = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
  const threads = Math.floor(freeMemory / scriptRam)
  ns.tprint(`Running ${targetScript} with ${threads} threads`)
  ns.exec(targetScript, host, threads)
}
