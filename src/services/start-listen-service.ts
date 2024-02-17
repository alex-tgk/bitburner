export async function main(ns: NS): Promise<void> {
    const hosts = ns.read('hosts.txt').split('\n').filter(o => o !== '').filter(Boolean);
    for (const host of hosts) {
        ns.scp('services/port-listen-service.js', host)
        const memoryUsage = ns.getScriptRam('services/port-listen-service.js')
        const serverRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
        const threads = Math.floor(serverRam / memoryUsage)
        if (threads <= 0) {
            continue
        }
        ns.exec('services/port-listen-service.js', host, threads)
    }
}