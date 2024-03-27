import { NS } from '@ns'
import {
  getAllScripts,
  selfRegisterScript,
} from '/scripts/script-tracker/script-tracker'
import { log } from '/scripts/logger/logger'

export async function main(ns: NS): Promise<void> {
  selfRegisterScript(ns)
  while (true) {
    await ns.sleep(500)
    checkPersistentScripts(ns)
  }
}

const checkPersistentScripts = (ns: NS) => {
  const scripts = getAllScripts(ns)

  for (const script of scripts) {
    if (!ns.scriptRunning(script.path, 'home')) {
      log(ns, `Running ${script.name}`, 'INFO', true)
      ns.run(script.path)
    }
  }
}
