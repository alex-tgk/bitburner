import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
  const db = ns.peek(18) as string
  ns.tprint(typeof JSON.parse(JSON.parse(db)))
}
