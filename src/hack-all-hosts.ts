/**
 * Hacks all the hosts listed in the 'hosts.txt' file using the 'hack.js' script.
 * 
 * @param ns - The namespace object for interacting with the game's API.
 * @returns A promise that resolves when all hosts have been hacked.
 */
export async function main(ns: NS): Promise<void> {
    const hosts = ns.read('hosts.txt').split('\n')
    const memoryRequired = ns.getScriptRam('hack.js')
    for (const host of hosts) {
        try {
            ns.scp('hack.js', host)
            const serverMemory = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
            const threads = Math.floor(serverMemory / memoryRequired)
            ns.exec('hack.js', host, threads)
            ns.tprint(`Hacking ${host} with ${threads} threads`)
        } catch {
            ns.tprint(`Failed to hack ${host}`)
        }
    }
}