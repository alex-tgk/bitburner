export async function main(ns: NS): Promise<void> {
  const target = ns.args[0]
  if (typeof target !== "string") {
    ns.tprint("Invalid target")
    ns.exit()
  }
  if (target === "") {
    ns.tprint("No target specified")
    ns.exit()
  }
  await hackTarget(ns, target)
}

async function hackTarget(ns: NS, target: string): Promise<void> {
  const moneyThresh = ns.getServerMaxMoney(target) * 0.75
  const securityThresh = ns.getServerMinSecurityLevel(target) + 5
  const money = ns.getServerMoneyAvailable(target)
  while (true) {
    try {
      await ns.hack(target)
      /* if (ns.getServerSecurityLevel(target) > securityThresh) {
                await ns.weaken(target);
            } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
                await ns.grow(target);
            } else {
                await ns.hack(target);
            } */
    } catch (e) {
      ns.tprint(`Hacking failed on ${target}`)
      ns.exit()
    }
  }
}
