export async function hackTarget(ns: NS, target: string): Promise<void> {
  const moneyThresh = ns.getServerMaxMoney(target) * 0.75
  const securityThresh = ns.getServerMinSecurityLevel(target) + 5

  while (true) {
    try {
      ns.tprint(`Hacking ${target}`)
      if (ns.getServerSecurityLevel(target) > securityThresh) {
        await ns.weaken(target)
      } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
        await ns.grow(target)
      } else {
        await ns.hack(target)
      }
      ns.tprint(`Hacked ${target}`)
    } catch (e) {
      ns.tprint(`Hacking failed on ${target}`)
      ns.exit()
    }
  }
}
