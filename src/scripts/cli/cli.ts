import { NS } from '@ns'
import { log } from '/scripts/logger/logger'

interface Args extends ReturnType<NS['flags']> {
  script: string
}

type Flags = [string, boolean | number | string | string[]][]
const flags = [['script', '']] as Flags

const scriptOptions = {
  'report-db': 'scripts/storage/print-store.js',
  'report-scripts': 'scripts/reports/report-scripts.js',
  'report-purchased': 'scripts/reports/report-purchased.js',
  'servers-shop': 'scripts/automation/shop-servers.js',
} as const

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: string[]) {
  return [flags.map((f) => `--${f[0]}`), ...Object.keys(scriptOptions)].filter(
    (a) => !args.find((arg) => arg.startsWith(a.toString())),
  )
}

export async function main(ns: NS): Promise<void> {
  const args = ns.flags(flags) as Args
  const selectedScript = args.script
  if (!selectedScript) {
    log(ns, 'No script selected.', 'ERROR', true)
  }
  const script = scriptOptions[selectedScript as keyof typeof scriptOptions]
  ns.tprint(`Running ${selectedScript}...`)
  ns.run(script)
}
