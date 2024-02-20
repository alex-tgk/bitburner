/**
 * Executes the main logic for nuking hosts.
 *
 * @param ns - The namespace object.
 * @returns A promise that resolves when the main logic is complete.
 */
export async function main(ns: NS): Promise<void> {
  const allHosts = ns.read("hosts.txt").split("\n")
  for (const host of allHosts) {
    if (host === "") {
      continue
    }
    await openPorts(ns, host)
    await tryNuke(ns, host)
  }
}

/**
 * Opens ports on the specified host using various port programs.
 *
 * @param ns - The namespace object.
 * @param host - The host to open ports on.
 * @returns A promise that resolves when all ports are opened.
 */
async function openPorts(ns: NS, host: string): Promise<void> {
  const portProgramFunctions = [
    ns.brutessh,
    ns.ftpcrack,
    ns.relaysmtp,
    ns.httpworm,
    ns.sqlinject,
  ]
  for (const program of portProgramFunctions) {
    try {
      await program(host)
    } catch {
      continue
    }
  }
}

/**
 * Attempts to nuke the specified host.
 *
 * @param ns - The namespace object.
 * @param host - The host to nuke.
 * @returns A promise that resolves when the nuke attempt is complete.
 */
async function tryNuke(ns: NS, host: string): Promise<void> {
  try {
    await ns.nuke(host)
    ns.tprint(`Nuked ${host}`)
  } catch (e) {
    ns.tprint(`Failed to nuke ${host}`)
  }
}
