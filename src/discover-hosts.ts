/**
 * Discovers all unique hosts in a network starting from a given host.
 * Writes the discovered hosts to a file.
 * @param ns - The namespace object.
 * @returns A promise that resolves when the discovery process is complete.
 */
export async function main(ns: NS): Promise<void> {
    //const allHosts = new Set<string>(); // Store all discovered hosts
    const startingHost = 'home'; // Usually start from 'home'

    // Start the discovery process by passing the ns object, the starting host, and the set of all hosts
    //await discoverHosts(ns, startingHost, allHosts);
    const allHosts = getAllServers(ns);
    // Write the discovered hosts to a file
    const filename = 'hosts.txt';
    // Ensure the file is empty before writing
    await ns.write(filename, '', 'w');
    for (const host of allHosts) {
        await ns.write(filename, host + '\n', 'a'); // Append each host to the file
    }

    ns.tprint(`Discovery complete. Found ${allHosts.length} hosts. Results saved to ${filename}`);
}

function getAllServers(ns: NS, start = 'home', visited = [] as string[]) {
    visited.push(start);
    const neighbors = ns.scan(start).filter(server => !visited.includes(server));
    for (const neighbor of neighbors) {
        visited.push(...getAllServers(ns, neighbor, visited).filter(server => !visited.includes(server)))
    }
    return Array.from(visited);
}

/**
 * Recursively discovers all unique hosts at the top level.
 * @param ns - The namespace object.
 * @param currentHost - The current host being discovered.
 * @param allHosts - The set of all discovered hosts.
 * @returns A promise that resolves when the discovery process is complete.
 */
async function discoverHosts(ns: NS, currentHost: string, allHosts: Set<string>): Promise<void> {
    if (allHosts.has(currentHost)) {
        // If already visited, skip to avoid cycles
        return;
    }

    // Mark the current host as visited
    allHosts.add(currentHost);

    // Get all directly connected hosts
    const connectedHosts = ns.scan(currentHost);
    for (const host of connectedHosts) {
        await discoverHosts(ns, host, allHosts); // Recursively discover from each connected host
    }
}
