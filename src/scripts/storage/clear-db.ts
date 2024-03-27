import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
  ns.clearPort(18)
  ns.rm('db.txt')
}
