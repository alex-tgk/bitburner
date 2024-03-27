import { NS } from '@ns'
import { log } from '/scripts/logger/logger'

interface Args extends ReturnType<NS['flags']> {
  delay: number
  target: string
}

export async function main(ns: NS): Promise<void> {
  const args = ns.flags([
    ['delay', 0],
    ['target', 'n00dles'],
  ]) as Args
  log(ns, `Hacking ${args.target} with a delay of ${args.delay}`, 'INFO')
  await ns.hack(args.target, { additionalMsec: args.delay })
}
