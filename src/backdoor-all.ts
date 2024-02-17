import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
    const hosts = ns.read('hosts.txt').split('\n')
    for (const host of hosts) {
        try {
            ns.exec('backdoor', host, 1)
            ns.tprint(`Backdoored ${host}`)
        } catch {
            ns.tprint(`Failed to backdoor ${host}`)
        }
    }
}