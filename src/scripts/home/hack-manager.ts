import { DataStore, ServerData, getDb, setDb } from '/scripts/storage/db-store'
import { log } from '/scripts/logger/logger'

interface HackTarget {
  target: string
  script: 'hack' | 'grow' | 'weaken'
  threads: number
  memoryRequired: number
  securityIncrease: number
}

//type HackInstruction =  ServerData & { script?: HackTarget }

type HackInstruction = HackTarget & { actor?: ServerData }

export async function main(ns: NS) {
  //selfRegisterScript(ns)
  await setupHackingScripts(ns, await getDb(ns))
  while (true) {
    const cycleTime = 100
    await ns.sleep(cycleTime)
    const db = await getDb(ns)
    if (db.totals.playerOwnedMemory >= 2000) {
      log(ns, `Player memory: ${db.totals.playerOwnedMemory}`, 'INFO', false)
      await ns.sleep(500)
      await setupHackingScripts(ns, await getDb(ns))
    }
  }
}

const runScript = (
  ns: NS,
  script: string,
  host = 'home',
  threads?: number,
  ...args: (string | number | boolean)[]
) => {
  if (!ns.fileExists(script)) {
    log(ns, `The script ${script} does not exist`, 'ERROR')
    return
  }
  /*   if (ns.isRunning(script, host, ...args)) {
    log(ns, `Script ${script} is already running`, 'ERROR')
    return
  } */
  log(ns, `Running ${script} on ${host}`, 'INFO', false)
  ns.exec(script, host, threads, ...args)
}

const setupHackingScripts = async (ns: NS, db: DataStore) => {
  const actors = db.hosts.filter((host) => host.hasRootAccess)
  const targets = db.hosts
    .filter((host) => !host.playerOwned)
    .sort((a, b) => a.maxMoney - b.maxMoney)

  const scripts = {
    hack: '/scripts/actions/hack.js',
    grow: '/scripts/actions/grow.js',
    weaken: '/scripts/actions/weaken.js',
  } as const

  const scriptMemoryUsage = {
    hack: ns.getScriptRam(scripts.hack, 'home'),
    grow: ns.getScriptRam(scripts.grow, 'home'),
    weaken: ns.getScriptRam(scripts.weaken, 'home'),
  }

  const maxRamAvailable = Math.max(...actors.map((x) => x.freeRam))

  const calculateHackThreads = (
    target: ServerData,
    stealRatio = 0.2,
  ): void | HackTarget => {
    if (stealRatio < 0.03) {
      ns.print('Steal ratio too low')
      return
    }
    const hackThreads = ns.hackAnalyzeThreads(
      target.name,
      target.maxMoney * stealRatio,
    )
    const memoryRequired = scriptMemoryUsage.hack * hackThreads
    if (memoryRequired > maxRamAvailable - 1000) {
      ns.print('Not enough memory')
      return calculateHackThreads(target, stealRatio - 0.02)
    }
    if (hackThreads <= 0) {
      ns.print('Not enough money')
      return
    }
    return {
      target: target.name,
      script: 'hack',
      threads: Math.ceil(hackThreads),
      memoryRequired,
      securityIncrease: ns.hackAnalyzeSecurity(hackThreads, target.name),
    }
  }

  const calculateGrowThreads = (target: ServerData): void | HackTarget => {
    // Skip hacking if the target has enough money
    const currentMoney = Math.max(ns.getServerMoneyAvailable(target.name), 1)
    const maxMoney = ns.getServerMaxMoney(target.name)
    if (currentMoney > target.maxMoney * 0.9) {
      return
    }
    const growThreads = Math.ceil(ns.growthAnalyze(target.name, 2))

    return {
      target: target.name,
      script: 'grow',
      threads: growThreads,
      memoryRequired: scriptMemoryUsage.grow * growThreads,
      securityIncrease: ns.growthAnalyzeSecurity(growThreads, target.name),
    }
  }

  const calculateWeakenThreads = (target: ServerData): void | HackTarget => {
    const weakenThreads = 50
    const maxWeakenTime = 60 * 1000 * 15
    if (target.securityLevel < 10) {
      return
    }
    if (ns.getWeakenTime(target.name) > maxWeakenTime) {
      return
    }
    return {
      target: target.name,
      script: 'weaken',
      threads: weakenThreads,
      memoryRequired: scriptMemoryUsage.weaken * weakenThreads,
      securityIncrease: -0.2,
    }
  }

  const scriptOptions: HackTarget[] = targets
    .filter((t) => t.hackingLevel <= ns.getHackingLevel())
    .reduce((prev: HackTarget[], target: ServerData) => {
      if (!target.hasRootAccess) {
        return prev
      }
      const hackOptions = calculateHackThreads(target)
      const growOptions = calculateGrowThreads(target)
      const weakenOptions = calculateWeakenThreads(target)

      return [
        ...prev,
        ...(hackOptions ? [hackOptions] : []),
        ...(growOptions ? [growOptions] : []),
        ...(weakenOptions ? [weakenOptions] : []),
      ] as HackTarget[]
    }, [])

  const sortOrder = {
    hack: 1,
    grow: 2,
    weaken: 3,
  }
  const scriptOptionsSorted = scriptOptions.sort(
    (a, b) => sortOrder[a.script] - sortOrder[b.script],
  )

  const instructions = assignActors(scriptOptionsSorted, actors)
  for (const hackingInstructions of instructions) {
    if (!hackingInstructions.actor) {
      continue
    }
    log(
      ns,
      `Assigning ${hackingInstructions.script} to ${hackingInstructions.actor.name}`,
      'INFO',
      false,
    )
    const { script, threads, target } = hackingInstructions
    if (!ns.fileExists(scripts[script], hackingInstructions.actor.name)) {
      ns.scp(scripts[script], hackingInstructions.actor.name)
    }
    runScript(
      ns,
      scripts[script],
      hackingInstructions.actor.name,
      threads,
      '--target',
      target,
    )
  }
  await setDb(ns, (db: DataStore) => {
    const updatedOn = new Date()
    const hosts = db.hosts.map((host) => {
      const script = instructions.find((x) => x?.actor?.name === host.name)
      return script
        ? {
            ...host,
            isBeingHacked: script.script === 'hack',
            isBeingGrown: script.script === 'grow',
          }
        : host
    })
    return { ...db, updatedOn, hosts }
  })
}

const assignActors = (
  scriptOptions: HackTarget[],
  actors: ServerData[],
): HackInstruction[] => {
  const actorsSorted = actors.sort((a, b) => a.freeRam - b.freeRam)
  const actorMemory = actors.map((actor) => ({
    name: actor.name,
    ram: actor.freeRam,
  }))

  const assignedScripts = scriptOptions.map((script) => {
    const { memoryRequired } = script
    const actor = actorMemory
      .filter((x) => x.ram >= memoryRequired)
      .sort((b, a) => a.ram - b.ram)
      .at(0)
    if (actor) {
      actor.ram -= memoryRequired || 0
      const actorData = actors.find((x) => x.name === actor.name)
      if (!actorData) {
        return script
      }
      return { ...script, actor: actorData }
    }
    return script
  }) as HackInstruction[]
  return assignedScripts.filter((x) => x.actor !== undefined)
}
