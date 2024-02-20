/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
  const factionName = ns.args[0]

  ns.tprint(`Started sharing for ${factionName}.`)

  // Continuously share computing power to gain reputation
  while (true) {
    await ns.share()
    // Log the current reputation gain rate if needed
    // ns.print(`Current reputation with ${factionName}: ${ns.getFactionRep(factionName)}`);
  }
}
