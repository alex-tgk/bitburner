import { DataStore, ServerData, getDb, setDb } from '/scripts/storage/db-store'
import { log } from '/scripts/utils/log'

const loopingScripts = ['/scripts/storage/refresh-db-store.js']

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
  const player = ns.getPlayer()
  log(ns, player, 'INFO', false)
  await setupHackingScripts(ns, await getDb(ns))
  let timeCounter = 0
  while (true) {
    await ns.sleep(5000)
    for (const script of loopingScripts) {
      try {
        runScript(ns, script)
      } catch (e) {
        log(ns, `Error running ${script}`, 'ERROR')
        if (e instanceof Error) {
          log(ns, e, 'ERROR')
        }
      }
    }
    timeCounter += 1
    if (timeCounter === 6) {
      timeCounter = 0
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
  const targets = db.hosts.filter((host) => !host.playerOwned)

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
    stealRatio = 0.3,
  ): void | HackTarget => {
    const hackThreads = ns.hackAnalyzeThreads(
      target.name,
      target.maxMoney * stealRatio,
    )
    if (hackThreads <= 0) {
      return
    }
    return {
      target: target.name,
      script: 'hack',
      threads: Math.ceil(hackThreads),
      memoryRequired: scriptMemoryUsage.hack * hackThreads,
      securityIncrease: ns.hackAnalyzeSecurity(hackThreads, target.name),
    }
  }

  const calculateGrowThreads = (target: ServerData): void | HackTarget => {
    // Skip hacking if the target has enough money
    if (target.moneyAvailable > target.maxMoney * 0.9) {
      return
    }
    const growThreads = Math.ceil(
      ns.growthAnalyze(target.name, target.maxMoney / target.moneyAvailable),
    )

    return {
      target: target.name,
      script: 'grow',
      threads: growThreads,
      memoryRequired: scriptMemoryUsage.grow * growThreads,
      securityIncrease: ns.growthAnalyzeSecurity(growThreads, target.name),
    }
  }

  const scriptOptions: HackTarget[] = targets.reduce(
    (prev: HackTarget[], target: ServerData) => {
      if (!target.hasRootAccess) {
        return prev
      }
      const hackOptions = calculateHackThreads(target)
      const growOptions = calculateGrowThreads(target)
      const weakenOptions =
        target.securityLevel > 5
          ? ({
              target: target.name,
              script: 'weaken',
              threads: 4,
              memoryRequired: scriptMemoryUsage.weaken * 4,
              securityIncrease: -0.2,
            } as HackTarget)
          : undefined
      return [
        ...prev,
        ...(hackOptions ? [hackOptions] : []),
        ...(growOptions ? [growOptions] : []),
        ...(weakenOptions ? [weakenOptions] : []),
      ] as HackTarget[]
    },
    [],
  )

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
      console.log(actorMemory)
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
