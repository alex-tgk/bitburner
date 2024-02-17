export async function main(ns: NS): Promise<void> {
    while (true) {
        const allHosts = getAllServers(ns);
        const filename = 'hosts.txt';
        await ns.write(filename, '', 'w');
        for (const host of allHosts) {
            await ns.write(filename, host + '\n', 'a');
        }
        await ns.sleep(60 * 1000);
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