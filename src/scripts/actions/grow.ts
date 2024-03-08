import { NS } from '@ns'

interface Args extends ReturnType<NS['flags']> {
  delay: number
  target: string
}

export async function main(ns: NS): Promise<void> {
  const args = ns.flags([
    ['delay', 0],
    ['target', 'n00dles'],
  ]) as Args

  await ns.grow(args.target, { additionalMsec: args.delay })
}
