import { log } from '/scripts/logger/logger'

const loopingScripts = [
  '/scripts/storage/refresh-db-store.js',
  '/scripts/storage/clear-db.js',
]
const runLoopingScripts = (ns: NS) => {
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
}

export async function main(ns: NS) {
  ns.atExit(() => {
    log(ns, 'Home server crashed', 'ERROR', true)
  })
  if (!ns.scriptRunning('watcher.js', 'home')) {
    ns.run('watcher.js')
  }
  if (!ns.scriptRunning('scripts/home/persistence-manager.js', 'home')) {
    ns.run('scripts/home/persistence-manager.js')
  }
  while (true) {
    const cycleTime = 2000
    await ns.sleep(cycleTime)
    runLoopingScripts(ns)
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
