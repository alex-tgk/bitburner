export async function main(ns: NS): Promise<void> {
    const hosts = getAllServers(ns).filter(host => host !== 'home').filter(host => host);
    for (const host of hosts) {
        try {
            ns.scp('services/port-listen-service.js', host)
        } catch {
            ns.tprintf(`Failed to copy port-listen-service.js to ${host}`)
            continue
        }
        const memoryUsage = ns.getScriptRam('services/port-listen-service.js')
        const serverRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
        const threads = Math.floor(serverRam / memoryUsage)
        if (threads <= 0 || threads === Infinity || isNaN(threads)) {
            continue
        }
        ns.exec('services/port-listen-service.js', host, threads)
    }
}


function getAllServers(ns: NS, start = 'home', visited = [] as string[]) {
    visited.push(start);
    const neighbors = ns.scan(start).filter(server => !visited.includes(server));
    for (const neighbor of neighbors) {
        visited.push(...getAllServers(ns, neighbor, visited).filter(server => !visited.includes(server)))
    }
    return Array.from(visited);
}