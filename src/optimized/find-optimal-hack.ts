/**
 * Use a set percentage of money to hack (I start with 30% of a server's max money)
 * Calculate the number of hack threads needed to take that much money from a server
 * Calculate the number of weaken threads to counter the sec increase from those hack threads
 * Calculate the number of grow threads to grow back to max money
 * Calculate the number of weaken threads to counter the sec increase from those grow threads
 * Sum up the RAM requirements for all 4 of those operations
 */

export function calculateBestHack(
  ns: NS,
  target: string,
  hackPercent = 0.3,
): number {
  const maxMoney = ns.getServerMaxMoney(target)
  const moneyToTake = maxMoney * hackPercent
  const hackThreads = ns.hackAnalyzeThreads(target, moneyToTake)
  //const hackSecurityIncrease = ns.hackAnalyzeSecurity(hackThreads, target)
  const growThreads = ns.growthAnalyze(target, 1 / (1 - hackPercent))
  //const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads, target)
  return hackThreads + growThreads
}

export class HackingOptimizer {
  private ns: NS
  private target: string
  private willHack: boolean
  private moneyRatio = 0.75
  private securityPadding = 5
  constructor(ns: NS, target: string) {
    this.ns = ns
    this.target = target
    this.willHack = this.canHack() && this.shouldHack()
  }

  private calculateGrowThreads(): number {
    const threads = Math.ceil(this.ns.growthAnalyze(this.target, 2))
    return threads
  }

  private shouldGrow(): boolean {
    const halfMaxMoney = this.ns.getServerMaxMoney(this.target) / 2
    const isLowOnFunds =
      this.ns.getServerMoneyAvailable(this.target) < halfMaxMoney
    if (isLowOnFunds) {
      return true
    }
    return false
  }

  private calculateSuggestedThreads(): number {
    const serverMoney = this.ns.getServerMoneyAvailable(this.target)
    if (serverMoney === 0) {
      return 0
    }
    const threadsToHackAvailable = this.ns.hackAnalyzeThreads(
      this.target,
      serverMoney,
    )
    return threadsToHackAvailable
  }

  private shouldHack(): boolean {
    const moneyThresh = this.ns.getServerMaxMoney(this.target) * this.moneyRatio

    const hasMoney = this.ns.getServerMoneyAvailable(this.target) > moneyThresh

    return hasMoney
  }

  private canHack(): boolean {
    const hasHackingSkill =
      this.ns.getServerRequiredHackingLevel(this.target) <=
      this.ns.getHackingLevel()
    const hasNuked = this.ns.hasRootAccess(this.target)
    return hasHackingSkill && hasNuked
  }

  private tryOpenPorts(): void {
    const portCrackingPrograms = [
      this.ns.brutessh,
      this.ns.ftpcrack,
      this.ns.relaysmtp,
      this.ns.httpworm,
      this.ns.sqlinject,
    ]
    if (this.ns.hasRootAccess(this.target)) {
      return
    }
    for (const program of portCrackingPrograms) {
      try {
        program(this.target)
      } catch {
        continue
      }
    }
  }

  private tryNuke(): boolean {
    if (this.ns.hasRootAccess(this.target)) {
      return true
    }
    this.tryOpenPorts()
    this.ns.nuke(this.target)
    return this.ns.hasRootAccess(this.target)
  }
}
